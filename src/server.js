import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import AIVerificationService from "./services/aiVerificationService.js";
// Removed CNN and satellite services

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|tiff|tif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, TIFF) are allowed'));
    }
  }
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
	console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment");
	process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const aiVerification = new AIVerificationService();
// CNN model removed

app.get("/health", (_req, res) => {
	res.json({ ok: true });
});

app.post(
	"/api/reports",
	upload.single("photo"),
	async (req, res) => {
		try {
			const { lat, lng, manual_location, pollution_type } = req.body;
			const file = req.file;

			if (!file) {
				return res.status(400).json({ error: "photo is required" });
			}
			if (!lat || !lng) {
				return res.status(400).json({ error: "lat and lng are required" });
			}
			if (!pollution_type) {
				return res.status(400).json({ error: "pollution_type is required" });
			}

			const fileExt = file.originalname.split(".").pop();
			const fileName = `${Date.now()}-${Math.random()
				.toString(36)
				.slice(2)}.${fileExt}`;
			const filePath = `reports/${fileName}`;

			const { data: uploadData, error: uploadError } = await supabase.storage
				.from("reports")
				.upload(filePath, file.buffer, {
					contentType: file.mimetype,
					upsert: false,
				});

			if (uploadError) {
				console.error("Storage upload error:", uploadError);
				return res.status(500).json({ error: `Storage upload failed: ${uploadError.message}` });
			}

			const { data: publicUrlData } = supabase.storage
				.from("reports")
				.getPublicUrl(uploadData.path);

			const { data: insertData, error: insertError } = await supabase
				.from("pollution_reports")
				.insert([
					{
						photo_url: publicUrlData.publicUrl,
						lat: parseFloat(lat),
						lng: parseFloat(lng),
						manual_location: manual_location || null,
						pollution_type,
						status: "Pending",
						ai_confidence: null,
					},
				])
				.select("id")
				.single();

			if (insertError) {
				console.error("Database insert error:", insertError);
				return res.status(500).json({ error: `Database insert failed: ${insertError.message}` });
			}

			return res.json({
				message: "Report Submitted. Awaiting AI Verification.",
				reportId: insertData.id,
			});
		} catch (err) {
			console.error("Error in POST /api/reports:", err);
			return res.status(500).json({ error: err.message || "Internal Server Error" });
		}
	}
);

app.get("/api/reports/:id/status", async (req, res) => {
	try {
		const reportId = req.params.id;
		const { data, error } = await supabase
			.from("pollution_reports")
			.select("id, status, ai_confidence")
			.eq("id", reportId)
			.single();

		if (error) {
			return res.status(404).json({ error: "Report not found" });
		}

		return res.json({
			reportId: data.id,
			status: data.status,
			ai_confidence: data.ai_confidence,
		});
	} catch (_err) {
		return res.status(500).json({ error: "Internal Server Error" });
	}
});

app.get("/api/reports", async (req, res) => {
	try {
		const { data, error } = await supabase
			.from("pollution_reports")
			.select("*")
			.order("created_at", { ascending: false });

		if (error) {
			return res.status(500).json({ error: error.message });
		}

		return res.json(data || []);
	} catch (_err) {
		return res.status(500).json({ error: "Internal Server Error" });
	}
});

// AI Verification endpoint with real-time satellite analysis
app.post("/api/reports/:id/verify", async (req, res) => {
	try {
		const reportId = req.params.id;
		
		// Get the report
		const { data: report, error: fetchError } = await supabase
			.from("pollution_reports")
			.select("lat, lng, pollution_type, photo_url")
			.eq("id", reportId)
			.single();

		if (fetchError) {
			return res.status(404).json({ error: "Report not found" });
		}

		console.log(`Starting AI verification for report ${reportId}`);

		// Perform AI verification with satellite imagery
		const verificationResult = await aiVerification.verifyReport(
			reportId,
			report.lat,
			report.lng,
			report.pollution_type,
			report.photo_url
		);

		// Update the report in database
		const { error: updateError } = await supabase
			.from("pollution_reports")
			.update({
				status: verificationResult.status,
				ai_confidence: verificationResult.confidence,
			})
			.eq("id", reportId);

		if (updateError) {
			console.error("Database update error:", updateError);
			return res.status(500).json({ error: updateError.message });
		}

		return res.json({
			reportId,
			status: verificationResult.status,
			verified: verificationResult.verified,
			ai_confidence: verificationResult.confidence,
			analysis: verificationResult.analysis,
			message: `Report ${verificationResult.verified ? "verified" : "rejected"} by AI with ${(verificationResult.confidence * 100).toFixed(1)}% confidence`,
		});
	} catch (error) {
		console.error("AI verification error:", error);
		return res.status(500).json({ error: "AI verification failed: " + error.message });
	}
});

// Batch AI verification endpoint
app.post("/api/reports/batch-verify", async (req, res) => {
	try {
		const { reportIds } = req.body;
		
		if (!reportIds || !Array.isArray(reportIds)) {
			return res.status(400).json({ error: "reportIds array is required" });
		}

		// Get all reports
		const { data: reports, error: fetchError } = await supabase
			.from("pollution_reports")
			.select("id, lat, lng, pollution_type, photo_url")
			.in("id", reportIds);

		if (fetchError) {
			return res.status(500).json({ error: fetchError.message });
		}

		// Perform batch verification
		const results = await aiVerification.batchVerifyReports(reports);

		// Update all reports in database
		const updatePromises = results.map(result => 
			supabase
				.from("pollution_reports")
				.update({
					status: result.status,
					ai_confidence: result.confidence,
				})
				.eq("id", result.reportId)
		);

		await Promise.all(updatePromises);

		return res.json({
			message: `Batch verification completed for ${results.length} reports`,
			results: results
		});
	} catch (error) {
		console.error("Batch verification error:", error);
		return res.status(500).json({ error: "Batch verification failed: " + error.message });
	}
});

// Get AI verification statistics
app.get("/api/ai/stats", async (req, res) => {
	try {
		const stats = aiVerification.getVerificationStats();
		return res.json(stats);
	} catch (error) {
		console.error("Stats error:", error);
		return res.status(500).json({ error: "Failed to get AI statistics" });
	}
});


// Simulate AI verification (for demo/testing)
app.post("/api/reports/:id/simulate-verify", async (req, res) => {
	try {
		const reportId = req.params.id;
		
		// Get the report
		const { data: report, error: fetchError } = await supabase
			.from("pollution_reports")
			.select("lat, lng, pollution_type")
			.eq("id", reportId)
			.single();

		if (fetchError) {
			return res.status(404).json({ error: "Report not found" });
		}

		// Simulate AI verification
		const verificationResult = await aiVerification.simulateVerification(
			reportId,
			report.lat,
			report.lng,
			report.pollution_type
		);

		// Update the report in database
		console.log(`Updating report ${reportId} with status: ${verificationResult.status}, confidence: ${verificationResult.confidence}`);
		
		const { data: updateData, error: updateError } = await supabase
			.from("pollution_reports")
			.update({
				status: verificationResult.status,
				ai_confidence: verificationResult.confidence,
			})
			.eq("id", reportId)
			.select();

		if (updateError) {
			console.error("Database update error:", updateError);
			return res.status(500).json({ error: updateError.message });
		}

		console.log("Database update successful:", updateData);

		return res.json({
			reportId,
			status: verificationResult.status,
			verified: verificationResult.verified,
			ai_confidence: verificationResult.confidence,
			analysis: verificationResult.analysis,
			message: `Report ${verificationResult.verified ? "verified" : "rejected"} by AI simulation with ${(verificationResult.confidence * 100).toFixed(1)}% confidence`,
		});
	} catch (error) {
		console.error("Simulation error:", error);
		return res.status(500).json({ error: "Simulation failed: " + error.message });
	}
});

// Handle uncaught exceptions to prevent server crashes
process.on('uncaughtException', (err) => {
	console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});



# Pollution Verification Backend

A comprehensive Python Flask backend for satellite image verification and CNN-based pollution classification. This system integrates with your existing pollution reporting app to verify user reports using satellite imagery and machine learning.

## Features

- **Satellite Data Integration**: Fetch satellite imagery from Google Earth Engine, Sentinel Hub, or NASA Landsat APIs
- **CNN Model for Pollution Classification**: Train and use CNN models to classify pollution types
- **Image Verification**: Compare user-uploaded images with satellite data for verification
- **Database Integration**: Support for PostgreSQL, MySQL, and SQLite databases
- **RESTful API**: Clean API endpoints for frontend integration
- **Modular Architecture**: Well-organized codebase with separate modules for different functionalities

## Pollution Categories

The system classifies images into the following categories:
- `plastic_pollution` - Plastic waste and debris
- `oil_spill` - Oil spills and petroleum contamination
- `algae_bloom` - Harmful algal blooms
- `sewage_discharge` - Sewage and wastewater discharge
- `turbidity` - Water turbidity and sediment
- `clean_water` - Clean, uncontaminated water

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd pollution_backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\\Scripts\\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configuration

```bash
# Copy environment template
cp env.example .env

# Edit .env file with your configuration
# At minimum, set your database and API keys
```

### 3. Database Setup

```bash
# Initialize database (creates tables)
python -c "from database.connection import init_db; init_db()"
```

### 4. Train the Model

```bash
# Prepare your training data in the following structure:
# data/training/
# ├── plastic_pollution/
# │   ├── image1.jpg
# │   └── image2.jpg
# ├── oil_spill/
# │   ├── image1.jpg
# │   └── image2.jpg
# └── ... (other categories)

# Train the model
python train.py --dataset_path ./data/training --epochs 50 --batch_size 32
```

### 5. Start the Server

```bash
# Start Flask development server
python app.py

# Or use gunicorn for production
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## API Endpoints

### Verification Endpoints

#### POST `/api/verify`
Verify a pollution report by comparing user and satellite images.

**Request Body:**
```json
{
  "report_id": 123,
  "latitude": 40.7128,
  "longitude": -74.0060,
  "date": "2025-01-20",
  "user_image_path": "/path/to/user/image.jpg"
}
```

**Response:**
```json
{
  "report_id": 123,
  "verified": true,
  "category": "plastic_pollution",
  "user_confidence": 0.85,
  "satellite_confidence": 0.78,
  "timestamp": "2025-01-20T12:00:00Z"
}
```

#### GET `/api/verify/{report_id}`
Get verification status for a specific report.

### Satellite Endpoints

#### POST `/api/satellite/fetch`
Fetch satellite image for given coordinates.

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "date": "2025-01-20"
}
```

#### POST `/api/satellite/analyze`
Analyze satellite image for pollution detection.

### Model Endpoints

#### GET `/api/model/info`
Get current model information.

#### POST `/api/model/classify`
Classify an image using the CNN model.

#### POST `/api/model/train`
Train the model with new data.

#### POST `/api/model/load`
Load a pre-trained model.

## Training Scripts

### train.py
Train a new CNN model from scratch.

```bash
python train.py --dataset_path ./data/training --epochs 50 --batch_size 32 --validation_split 0.2
```

**Arguments:**
- `--dataset_path`: Path to training dataset directory
- `--epochs`: Number of training epochs (default: 50)
- `--batch_size`: Batch size for training (default: 32)
- `--validation_split`: Validation split ratio (default: 0.2)
- `--learning_rate`: Learning rate (default: 0.001)
- `--model_name`: Name for the trained model (default: pollution_cnn)

### predict.py
Classify a single image using a trained model.

```bash
python predict.py --image_path ./test_image.jpg --model_path ./models/pollution_cnn.h5
```

**Arguments:**
- `--image_path`: Path to image file to classify
- `--model_path`: Path to trained model file
- `--output`: Output file path for prediction results (JSON format)
- `--verbose`: Print detailed prediction information

## Database Configuration

The system supports multiple database types:

### SQLite (Default)
```env
DATABASE_TYPE=sqlite
DATABASE_URL=sqlite:///./pollution_verification.db
```

### PostgreSQL
```env
DATABASE_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pollution_db
DB_USER=postgres
DB_PASSWORD=password
```

### MySQL
```env
DATABASE_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pollution_db
DB_USER=root
DB_PASSWORD=password
```

## Satellite Imagery APIs

### Google Earth Engine
1. Sign up at [Google Earth Engine](https://earthengine.google.com/)
2. Get your API key
3. Set `GOOGLE_EARTH_ENGINE_KEY` in your `.env` file

### Sentinel Hub
1. Sign up at [Sentinel Hub](https://www.sentinel-hub.com/)
2. Get your API token
3. Set `SENTINEL_HUB_TOKEN` in your `.env` file

### NASA Landsat (Free)
1. Get API key from [NASA API](https://api.nasa.gov/)
2. Set `NASA_API_KEY` in your `.env` file

## Project Structure

```
pollution_backend/
├── api/                    # API endpoints
│   ├── __init__.py
│   ├── verification.py     # Verification endpoints
│   ├── satellite.py        # Satellite data endpoints
│   └── model.py           # Model management endpoints
├── database/              # Database models and connection
│   ├── __init__.py
│   ├── connection.py      # Database connection
│   └── models.py          # SQLAlchemy models
├── services/              # Business logic services
│   ├── __init__.py
│   ├── cnn_service.py     # CNN classification service
│   ├── satellite_service.py # Satellite imagery service
│   ├── verification_service.py # Verification logic
│   └── training_service.py # Model training service
├── data/                  # Data directories
│   ├── training/          # Training dataset
│   └── satellite_images/  # Cached satellite images
├── models/                # Trained models
├── logs/                  # Log files
├── app.py                 # Main Flask application
├── train.py              # Training script
├── predict.py            # Prediction script
├── requirements.txt      # Python dependencies
├── env.example          # Environment variables template
└── README.md            # This file
```

## Integration with Frontend

The API returns JSON responses that can be easily consumed by Angular, React, or any frontend framework.

### Example Frontend Integration (JavaScript)

```javascript
// Verify a pollution report
async function verifyReport(reportId, lat, lng, imagePath) {
  const response = await fetch('/api/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      report_id: reportId,
      latitude: lat,
      longitude: lng,
      user_image_path: imagePath
    })
  });
  
  const result = await response.json();
  return result;
}

// Get verification status
async function getVerificationStatus(reportId) {
  const response = await fetch(`/api/verify/${reportId}`);
  const result = await response.json();
  return result;
}
```

## Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black .
```

### Linting
```bash
flake8 .
```

## Production Deployment

### Using Gunicorn
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Using Docker
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

### Environment Variables for Production
- Set `FLASK_DEBUG=False`
- Use a production database (PostgreSQL recommended)
- Set secure `SECRET_KEY` and `JWT_SECRET_KEY`
- Configure proper CORS origins
- Set up logging

## Troubleshooting

### Common Issues

1. **Model not loading**: Ensure the model file exists and is compatible with your TensorFlow version
2. **Database connection errors**: Check your database configuration and ensure the database server is running
3. **Satellite API errors**: Verify your API keys and check API quotas
4. **Memory issues during training**: Reduce batch size or use a machine with more RAM

### Logs
Check the log files in the `logs/` directory for detailed error information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue on GitHub or contact the development team.

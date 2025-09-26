import os
import sys
import json
import tempfile
import argparse
from typing import Tuple

from PIL import Image

# satdata_client is a sibling project folder in the workspace
sys.path.append(os.path.join(os.path.dirname(__file__), "satdata_client", "satdata_client"))
from sentinel_client import SentinelClient  # type: ignore

from predict import predict_image


def fetch_satellite_image(lat: float, lon: float, date: str, size: Tuple[int, int]) -> Image.Image:
    # Build a small bbox around the point (~0.02 degrees box)
    delta = 0.02
    bbox = [lon - delta, lat - delta, lon + delta, lat + delta]
    time_interval = (date, date)
    client = SentinelClient()
    arr, pil_img = client.request_image(bbox, time_interval, size[1], size[0])
    if isinstance(pil_img, Image.Image):
        return pil_img.convert("RGB")
    return Image.fromarray(arr).convert("RGB")


def decide(user_pred: Tuple[str, float], sat_pred: Tuple[str, float], threshold: float) -> str:
    ulab, uconf = user_pred
    slab, sconf = sat_pred
    if ulab == "polluted" and slab == "polluted" and uconf >= threshold and sconf >= threshold:
        return "verified"
    if ulab == "clean" and slab == "clean" and uconf >= threshold and sconf >= threshold:
        return "not_verified"
    return "pending"


def main():
    parser = argparse.ArgumentParser(description="Verify report by comparing predictions on user and satellite images")
    parser.add_argument("--user_img", required=True, help="Path to user image")
    parser.add_argument("--lat", type=float, required=True)
    parser.add_argument("--lon", type=float, required=True)
    parser.add_argument("--date", required=True, help="YYYY-MM-DD")
    parser.add_argument("--model", default="model.h5", help="Path to model.h5")
    parser.add_argument("--threshold", type=float, default=0.6)
    args = parser.parse_args()

    # Predict on user image
    user_pred = predict_image(args.user_img, args.model)

    # Fetch satellite image and predict
    sat_img = fetch_satellite_image(args.lat, args.lon, args.date, (224, 224))
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        tmp_path = tmp.name
        sat_img.save(tmp_path)
    try:
        sat_pred = predict_image(tmp_path, args.model)
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass

    result = decide(user_pred, sat_pred, args.threshold)

    output = {
        "user": {"prediction": user_pred[0], "confidence": user_pred[1]},
        "satellite": {"prediction": sat_pred[0], "confidence": sat_pred[1]},
        "result": result,
    }
    print(json.dumps(output))


if __name__ == "__main__":
    main()



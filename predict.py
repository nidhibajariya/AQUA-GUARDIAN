import os
import argparse
from typing import Tuple

import numpy as np
from PIL import Image

import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input as mobilenet_preprocess


def _center_crop_to_square(img: Image.Image) -> Image.Image:
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return img.crop((left, top, left + side, top + side))


def _load_model(model_path: str = "model.h5") -> tf.keras.Model:
    if not os.path.isfile(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")
    return tf.keras.models.load_model(model_path)


def _prepare_image(image_path: str, size: Tuple[int, int] = (224, 224)) -> np.ndarray:
    img = Image.open(image_path).convert("RGB")
    img = _center_crop_to_square(img)
    img = img.resize(size)
    arr = np.asarray(img, dtype=np.float32)
    arr = mobilenet_preprocess(arr)
    arr = np.expand_dims(arr, 0)
    return arr


def predict_image(image_path: str, model_path: str = "model.h5") -> Tuple[str, float]:
    """
    Runs prediction on a single image and returns (label, confidence).

    - label: "clean" or "polluted"
    - confidence: probability of the predicted class (max(p, 1-p))
    """
    model = _load_model(model_path)
    arr = _prepare_image(image_path)
    prob_polluted = float(model.predict(arr, verbose=0).squeeze())
    if prob_polluted >= 0.5:
        return "polluted", prob_polluted
    return "clean", 1.0 - prob_polluted


def main():
    parser = argparse.ArgumentParser(description="Predict clean vs polluted for a single image")
    parser.add_argument("--image", required=True, help="Path to image file")
    parser.add_argument("--model", default="model.h5", help="Path to Keras model (.h5)")
    args = parser.parse_args()

    label, conf = predict_image(args.image, args.model)
    print("prediction:", label)
    print("confidence:", round(conf, 4))


if __name__ == "__main__":
    main()



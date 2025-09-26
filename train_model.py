import os
import argparse

import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input as mobilenet_preprocess
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras import layers, Model
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau


def build_model(input_shape=(224, 224, 3)) -> Model:
    base = MobileNetV2(include_top=False, weights="imagenet", input_shape=input_shape)
    base.trainable = False

    inputs = layers.Input(shape=input_shape)
    x = layers.Lambda(mobilenet_preprocess)(inputs)
    x = base(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(1, activation="sigmoid")(x)
    model = Model(inputs, outputs)
    return model


def main():
    parser = argparse.ArgumentParser(description="Train MobileNetV2 binary classifier for clean vs polluted water")
    parser.add_argument("--dataset_dir", type=str, default="dataset", help="Path with subfolders clean/ and polluted/")
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--val_split", type=float, default=0.2)
    parser.add_argument("--output", type=str, default="model.h5")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    if not os.path.isdir(args.dataset_dir):
        raise FileNotFoundError(f"Dataset directory not found: {args.dataset_dir}")

    img_size = (224, 224)

    train_datagen = ImageDataGenerator(
        preprocessing_function=mobilenet_preprocess,
        validation_split=args.val_split,
        rotation_range=20,
        width_shift_range=0.1,
        height_shift_range=0.1,
        zoom_range=0.15,
        shear_range=0.1,
        horizontal_flip=True,
        fill_mode="nearest",
    )

    val_datagen = ImageDataGenerator(
        preprocessing_function=mobilenet_preprocess,
        validation_split=args.val_split,
    )

    train_gen = train_datagen.flow_from_directory(
        args.dataset_dir,
        target_size=img_size,
        batch_size=args.batch_size,
        class_mode="binary",
        shuffle=True,
        subset="training",
        seed=args.seed,
    )

    val_gen = val_datagen.flow_from_directory(
        args.dataset_dir,
        target_size=img_size,
        batch_size=args.batch_size,
        class_mode="binary",
        shuffle=False,
        subset="validation",
        seed=args.seed,
    )

    expected_classes = set(["clean", "polluted"])
    if set(train_gen.class_indices.keys()) != expected_classes:
        raise ValueError(f"Expected class folders 'clean' and 'polluted'. Found: {list(train_gen.class_indices.keys())}")

    model = build_model(input_shape=(224, 224, 3))
    model.compile(optimizer=tf.keras.optimizers.Adam(1e-3), loss="binary_crossentropy", metrics=["accuracy", tf.keras.metrics.AUC(name="auc")])

    callbacks = [
        ModelCheckpoint(args.output, monitor="val_accuracy", save_best_only=True, verbose=1),
        EarlyStopping(monitor="val_accuracy", patience=3, restore_best_weights=True),
        ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=2, verbose=1),
    ]

    model.fit(train_gen, validation_data=val_gen, epochs=args.epochs, callbacks=callbacks)

    # Optional light fine-tuning
    model.layers[2].trainable = True  # unfreeze MobileNetV2 base
    for layer in model.layers[2].layers[:-30]:
        layer.trainable = False
    model.compile(optimizer=tf.keras.optimizers.Adam(1e-4), loss="binary_crossentropy", metrics=["accuracy", tf.keras.metrics.AUC(name="auc")])
    model.fit(train_gen, validation_data=val_gen, epochs=max(2, args.epochs // 3), callbacks=callbacks)

    model.save(args.output)
    print(f"Saved model to {args.output}")


if __name__ == "__main__":
    main()



"""Train a tiny dense ("CNN-like") classifier on MediaPipe keypoints.

Despite the name we use a Dense network because the input is already a
keypoint vector rather than an image. The name is kept for parity with
`recognizer.ts`. Replace the architecture with a true Conv1D/Conv2D stack
if you want to consume image crops instead.
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from tensorflow.keras import layers, models  # noqa: E402

ROOT = Path(__file__).parent
DATA = ROOT / "landmarks_alphabet.npz"
OUT_DIR = ROOT / "models" / "cnn_letters"


def build_model(input_dim: int, num_classes: int) -> tf.keras.Model:
    model = models.Sequential(
        [
            layers.Input(shape=(input_dim,)),
            layers.Dense(128, activation="relu"),
            layers.Dropout(0.3),
            layers.Dense(64, activation="relu"),
            layers.Dropout(0.2),
            layers.Dense(num_classes, activation="softmax"),
        ]
    )
    model.compile(
        optimizer=tf.keras.optimizers.Adam(1e-3),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def main() -> None:
    if not DATA.exists():
        raise SystemExit("Run extract_landmarks.py first to produce landmarks_alphabet.npz")
    blob = np.load(DATA, allow_pickle=True)
    X, y, labels = blob["X"], blob["y"], blob["labels"].tolist()

    x_train, x_val, y_train, y_val = train_test_split(
        X, y, test_size=0.15, random_state=42, stratify=y
    )

    model = build_model(X.shape[1], len(labels))
    model.summary()
    model.fit(
        x_train,
        y_train,
        validation_data=(x_val, y_val),
        epochs=80,
        batch_size=64,
        callbacks=[tf.keras.callbacks.EarlyStopping(patience=10, restore_best_weights=True)],
    )

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    keras_path = OUT_DIR / "model.keras"
    model.save(keras_path)
    (OUT_DIR / "labels.json").write_text(json.dumps({"labels": labels}, indent=2))
    print(f"Saved Keras model to {keras_path}; run export_to_tfjs.py next.")


if __name__ == "__main__":
    main()

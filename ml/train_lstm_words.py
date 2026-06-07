"""Train a 2-layer LSTM on sequences of MediaPipe landmark frames.

Expects landmark sequences in `landmarks_words.npz` with keys:
    X (N, 30, 63), y (N,), labels (list[str])

`extract_landmark_sequences.py` (TODO: record your own video clips) produces
this file. Until you have your own data, the frontend falls back to the
keypoint-template recogniser.
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from tensorflow.keras import layers, models  # noqa: E402

ROOT = Path(__file__).parent
DATA = ROOT / "landmarks_words.npz"
OUT_DIR = ROOT / "models" / "lstm_words"

SEQUENCE_LEN = 30
FEATURE_DIM = 63


def build_model(num_classes: int) -> tf.keras.Model:
    model = models.Sequential(
        [
            layers.Input(shape=(SEQUENCE_LEN, FEATURE_DIM)),
            layers.LSTM(64, return_sequences=True),
            layers.Dropout(0.3),
            layers.LSTM(32),
            layers.Dropout(0.2),
            layers.Dense(32, activation="relu"),
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
        raise SystemExit("Provide your own landmarks_words.npz (see ml/README.md).")
    blob = np.load(DATA, allow_pickle=True)
    X, y, labels = blob["X"], blob["y"], blob["labels"].tolist()
    assert X.shape[1:] == (SEQUENCE_LEN, FEATURE_DIM), X.shape

    x_train, x_val, y_train, y_val = train_test_split(
        X, y, test_size=0.15, random_state=42, stratify=y
    )

    model = build_model(len(labels))
    model.summary()
    model.fit(
        x_train,
        y_train,
        validation_data=(x_val, y_val),
        epochs=120,
        batch_size=32,
        callbacks=[tf.keras.callbacks.EarlyStopping(patience=15, restore_best_weights=True)],
    )

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    keras_path = OUT_DIR / "model.keras"
    model.save(keras_path)
    (OUT_DIR / "labels.json").write_text(json.dumps({"labels": labels}, indent=2))
    print(f"Saved Keras model to {keras_path}; run export_to_tfjs.py next.")


if __name__ == "__main__":
    main()

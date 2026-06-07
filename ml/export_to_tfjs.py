"""Convert trained Keras models to TF.js Layers format for in-browser use."""

from __future__ import annotations

import shutil
from pathlib import Path

import tensorflowjs as tfjs
from tensorflow.keras import models

ROOT = Path(__file__).parent
TARGETS = [
    ROOT / "models" / "cnn_letters",
    ROOT / "models" / "lstm_words",
]
FRONTEND_OUT = ROOT.parent / "frontend" / "public" / "models"


def export(model_dir: Path) -> None:
    keras_path = model_dir / "model.keras"
    if not keras_path.exists():
        print(f"Skipping {model_dir.name}: no model.keras found.")
        return
    model = models.load_model(keras_path)
    tfjs_out = model_dir
    tfjs.converters.save_keras_model(model, str(tfjs_out))
    print(f"Exported TF.js model to {tfjs_out}")

    frontend_target = FRONTEND_OUT / model_dir.name
    frontend_target.mkdir(parents=True, exist_ok=True)
    for f in tfjs_out.iterdir():
        if f.suffix in {".json", ".bin"} or f.name == "labels.json":
            shutil.copy2(f, frontend_target / f.name)
    print(f"Copied to {frontend_target}")


def main() -> None:
    for target in TARGETS:
        export(target)


if __name__ == "__main__":
    main()

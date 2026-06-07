"""Extract MediaPipe Hands keypoints for every image in the SIBI dataset.

Outputs:
    landmarks_alphabet.npz with keys X (N, 63), y (N,), labels (list[str]).
"""

from __future__ import annotations

from pathlib import Path

import cv2
import mediapipe as mp
import numpy as np
from tqdm import tqdm

DATA_DIR = Path(__file__).parent / "data" / "alphabet"
OUTPUT = Path(__file__).parent / "landmarks_alphabet.npz"


def normalise(landmarks: np.ndarray) -> np.ndarray:
    """Translate to wrist origin and scale by wrist→middle-MCP distance."""
    wrist = landmarks[0]
    mcp = landmarks[9]
    scale = np.linalg.norm(mcp - wrist) or 1.0
    return ((landmarks - wrist) / scale).astype(np.float32).flatten()


def main() -> None:
    if not DATA_DIR.exists():
        raise SystemExit(f"Run download_dataset.py first. Missing: {DATA_DIR}")

    labels = sorted([d.name for d in DATA_DIR.iterdir() if d.is_dir()])
    label_to_idx = {lbl: i for i, lbl in enumerate(labels)}
    print(f"Found {len(labels)} classes: {labels}")

    hands = mp.solutions.hands.Hands(
        static_image_mode=True, max_num_hands=1, min_detection_confidence=0.5
    )

    feats: list[np.ndarray] = []
    targets: list[int] = []

    for lbl in labels:
        class_dir = DATA_DIR / lbl
        images = [
            p
            for p in class_dir.rglob("*")
            if p.suffix.lower() in {".jpg", ".jpeg", ".png"}
        ]
        for img_path in tqdm(images, desc=lbl, leave=False):
            img = cv2.imread(str(img_path))
            if img is None:
                continue
            rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            res = hands.process(rgb)
            if not res.multi_hand_landmarks:
                continue
            lm = np.array(
                [(p.x, p.y, p.z) for p in res.multi_hand_landmarks[0].landmark],
                dtype=np.float32,
            )
            feats.append(normalise(lm))
            targets.append(label_to_idx[lbl])

    X = np.stack(feats)
    y = np.array(targets, dtype=np.int64)
    np.savez_compressed(OUTPUT, X=X, y=y, labels=np.array(labels))
    print(f"Saved {OUTPUT} with {len(X)} samples.")


if __name__ == "__main__":
    main()

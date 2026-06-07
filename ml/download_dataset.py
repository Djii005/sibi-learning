"""Download the SIBI alphabet dataset from Kaggle into ./data/."""

from __future__ import annotations

import shutil
from pathlib import Path

import kagglehub

DATA_DIR = Path(__file__).parent / "data" / "alphabet"
KAGGLE_SLUG = "mlanangafkaar/datasets-lemlitbang-sibi-alphabets"


def main() -> None:
    DATA_DIR.parent.mkdir(parents=True, exist_ok=True)
    cached = Path(kagglehub.dataset_download(KAGGLE_SLUG))
    print(f"Downloaded dataset to: {cached}")
    if DATA_DIR.exists():
        shutil.rmtree(DATA_DIR)
    shutil.copytree(cached, DATA_DIR)
    print(f"Copied to: {DATA_DIR}")


if __name__ == "__main__":
    main()

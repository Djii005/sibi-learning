# SIBI ML Training Pipeline

This folder contains the training scripts used to produce the lightweight CNN
and LSTM models served by the web app. Everything in the pipeline runs on the
free Kaggle/Colab tier — no paid GPU is required.

## Quick start (Colab / local)

```bash
pip install -r requirements.txt
python download_dataset.py                 # downloads via kagglehub
jupyter notebook train.ipynb               # or run the .py scripts directly
python train_cnn_letters.py                # ~3 min CPU, 30 s GPU
python train_lstm_words.py                 # ~5 min CPU, 1 min GPU
python export_to_tfjs.py                   # writes models/ -> ../models/
```

Once exported, copy `models/cnn_letters/` and `models/lstm_words/` into
`frontend/public/models/`. The frontend will pick them up automatically on the
next reload (`recognizer.ts` HEAD-checks the file before loading).

## Dataset

We use [SIBI Alphabets (Lemlitbang)](https://www.kaggle.com/datasets/mlanangafkaar/datasets-lemlitbang-sibi-alphabets)
for the static-letter CNN. To extend the LSTM module beyond the demo labels,
record short videos of yourself performing each dynamic gesture (greetings,
common words) and add them to `data/dynamic/<label>/`.

## Why landmarks instead of raw pixels?

Both models consume the **63-dim MediaPipe landmark vector** (21 hand points
× xyz) rather than raw image crops. This means:

- Models are tiny (≈ 30 KB CNN, ≈ 80 KB LSTM) and run in any browser via TF.js.
- Training is fast even on free Kaggle CPUs.
- The recogniser is robust to lighting, skin tone, and camera angle.

## Outputs

```
models/cnn_letters/model.json + group1-shard1of1.bin + labels.json
models/lstm_words/model.json  + group1-shard1of1.bin + labels.json
```

The `labels.json` file is read by `frontend/src/ml/recognizer.ts` so the
frontend knows what each output index maps to.

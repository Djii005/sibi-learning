/**
 * Sign recognizer that orchestrates MediaPipe + the classifier.
 *
 * Lookup order for the classifier:
 *  1. TF.js CNN/LSTM models served from `/models/cnn_letters/model.json` and
 *     `/models/lstm_words/model.json`. These are produced by `ml/train.ipynb`
 *     using a Kaggle SIBI dataset. They are loaded lazily on first use.
 *  2. Keypoint-template similarity fallback (see `references.ts`). This makes
 *     the recognition demo usable on day one without requiring training.
 */

import * as tf from "@tensorflow/tfjs";

import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

import {
  FEATURE_DIM,
  cosineSimilarity,
  normaliseLandmarks,
  similarityToScore,
} from "./features";
import { templateFor } from "./references";

export interface RecognitionResult {
  label: string;
  score: number;
  source: "cnn" | "lstm" | "template";
}

const CNN_URL = "/models/cnn_letters/model.json";
const LSTM_URL = "/models/lstm_words/model.json";

let cnnPromise: Promise<tf.LayersModel | null> | null = null;
let lstmPromise: Promise<tf.LayersModel | null> | null = null;
let cnnLabels: string[] | null = null;
let lstmLabels: string[] | null = null;

async function loadModel(url: string): Promise<tf.LayersModel | null> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    if (!res.ok) return null;
  } catch {
    return null;
  }
  try {
    return await tf.loadLayersModel(url);
  } catch {
    return null;
  }
}

async function loadLabels(modelUrl: string): Promise<string[] | null> {
  try {
    const labelsUrl = modelUrl.replace(/model\.json$/, "labels.json");
    const res = await fetch(labelsUrl);
    if (!res.ok) return null;
    const data = (await res.json()) as { labels?: string[] };
    return data.labels ?? null;
  } catch {
    return null;
  }
}

async function ensureCnn(): Promise<tf.LayersModel | null> {
  if (!cnnPromise) {
    cnnPromise = loadModel(CNN_URL).then(async (model) => {
      if (model) cnnLabels = await loadLabels(CNN_URL);
      return model;
    });
  }
  return cnnPromise;
}

async function ensureLstm(): Promise<tf.LayersModel | null> {
  if (!lstmPromise) {
    lstmPromise = loadModel(LSTM_URL).then(async (model) => {
      if (model) lstmLabels = await loadLabels(LSTM_URL);
      return model;
    });
  }
  return lstmPromise;
}

/** Recognise a static sign from a single frame of landmarks. */
export async function recognizeStatic(
  landmarks: NormalizedLandmark[],
  candidateLabels: string[],
): Promise<RecognitionResult> {
  const features = normaliseLandmarks(landmarks);
  const cnn = await ensureCnn();
  if (cnn && cnnLabels && cnnLabels.length > 0) {
    const input = tf.tensor2d(features, [1, FEATURE_DIM]);
    try {
      const out = cnn.predict(input) as tf.Tensor;
      const probs = Array.from(await out.data());
      out.dispose();
      let best = { idx: 0, value: -Infinity };
      probs.forEach((value, idx) => {
        const label = cnnLabels?.[idx];
        if (label && candidateLabels.includes(label) && value > best.value) {
          best = { idx, value };
        }
      });
      const label = cnnLabels[best.idx] ?? candidateLabels[0];
      return { label, score: Math.max(0, Math.min(1, best.value)), source: "cnn" };
    } finally {
      input.dispose();
    }
  }

  // Template fallback.
  let bestLabel = candidateLabels[0] ?? "?";
  let bestScore = -1;
  for (const label of candidateLabels) {
    const sim = cosineSimilarity(features, templateFor(label));
    if (sim > bestScore) {
      bestScore = sim;
      bestLabel = label;
    }
  }
  return { label: bestLabel, score: similarityToScore(bestScore), source: "template" };
}

/** Recognise a dynamic gesture from a 30-frame buffer. */
export async function recognizeDynamic(
  frames: NormalizedLandmark[][],
  candidateLabels: string[],
): Promise<RecognitionResult> {
  if (frames.length === 0) {
    return { label: candidateLabels[0] ?? "?", score: 0, source: "template" };
  }
  const sequence = frames.map(normaliseLandmarks);

  const lstm = await ensureLstm();
  if (lstm && lstmLabels && lstmLabels.length > 0) {
    const flat = new Float32Array(sequence.length * FEATURE_DIM);
    sequence.forEach((row, idx) => flat.set(row, idx * FEATURE_DIM));
    const input = tf.tensor3d(flat, [1, sequence.length, FEATURE_DIM]);
    try {
      const out = lstm.predict(input) as tf.Tensor;
      const probs = Array.from(await out.data());
      out.dispose();
      let best = { idx: 0, value: -Infinity };
      probs.forEach((value, idx) => {
        const label = lstmLabels?.[idx];
        if (label && candidateLabels.includes(label) && value > best.value) {
          best = { idx, value };
        }
      });
      const label = lstmLabels[best.idx] ?? candidateLabels[0];
      return { label, score: Math.max(0, Math.min(1, best.value)), source: "lstm" };
    } finally {
      input.dispose();
    }
  }

  // Template fallback over averaged keypoints (sufficient as a placeholder
  // until a real LSTM is trained).
  const avg = new Float32Array(FEATURE_DIM);
  sequence.forEach((row) => {
    for (let i = 0; i < FEATURE_DIM; i += 1) avg[i] += row[i];
  });
  for (let i = 0; i < FEATURE_DIM; i += 1) avg[i] /= sequence.length;

  let bestLabel = candidateLabels[0] ?? "?";
  let bestScore = -1;
  for (const label of candidateLabels) {
    const sim = cosineSimilarity(avg, templateFor(label));
    if (sim > bestScore) {
      bestScore = sim;
      bestLabel = label;
    }
  }
  return { label: bestLabel, score: similarityToScore(bestScore), source: "template" };
}

/**
 * Feature extraction utilities for SIBI sign recognition.
 *
 * MediaPipe Hands returns 21 landmarks per hand, each with normalised
 * (x, y, z) coordinates. The classifier inputs in this project always come
 * from these 21 keypoints so the same code works whether the user is on a
 * phone or a laptop.
 */

import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export const LANDMARK_COUNT = 21;
export const FEATURE_DIM = LANDMARK_COUNT * 3; // x, y, z per landmark

/**
 * Normalise a single frame of landmarks to be translation- and scale-invariant.
 *
 * Strategy:
 *  1. Translate so landmark 0 (wrist) is the origin.
 *  2. Scale so the distance wrist → middle-finger-MCP (landmark 9) is 1.
 *  3. Flatten to a 1-D Float32Array of length 63.
 */
export function normaliseLandmarks(landmarks: NormalizedLandmark[]): Float32Array {
  if (landmarks.length < LANDMARK_COUNT) {
    return new Float32Array(FEATURE_DIM);
  }

  const wrist = landmarks[0];
  const mcp = landmarks[9];
  const dx = mcp.x - wrist.x;
  const dy = mcp.y - wrist.y;
  const dz = mcp.z - wrist.z;
  const scale = Math.hypot(dx, dy, dz) || 1;

  const out = new Float32Array(FEATURE_DIM);
  for (let i = 0; i < LANDMARK_COUNT; i += 1) {
    const p = landmarks[i];
    out[i * 3 + 0] = (p.x - wrist.x) / scale;
    out[i * 3 + 1] = (p.y - wrist.y) / scale;
    out[i * 3 + 2] = (p.z - wrist.z) / scale;
  }
  return out;
}

/** Cosine similarity between two feature vectors (range -1..1). */
export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  if (denom === 0) return 0;
  return dot / denom;
}

/** Map similarity in -1..1 to a 0..1 score for UI display. */
export function similarityToScore(sim: number): number {
  return Math.max(0, Math.min(1, (sim + 1) / 2));
}

/**
 * Reference keypoint templates for the demo classifier.
 *
 * These hand-tuned templates roughly match the MediaPipe landmark layout for
 * each SIBI alphabet letter and provide a usable baseline classifier that
 * works without any training. Once you train a real CNN/LSTM via
 * `ml/train.ipynb`, drop the exported TF.js model into `public/models/` and
 * the application will prefer it over this fallback.
 *
 * Each template is a length-63 Float32Array produced by `normaliseLandmarks`
 * on a canonical pose.
 */

import { LANDMARK_COUNT, normaliseLandmarks } from "./features";

import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

type Pose = [number, number, number][]; // 21 landmarks

/** Build a NormalizedLandmark[] from a raw pose array. */
function pose(points: Pose): NormalizedLandmark[] {
  return points.map(([x, y, z]) => ({ x, y, z, visibility: 1 }));
}

/**
 * Canonical poses for a handful of letters. The numbers are intentionally
 * simple and based on a right hand viewed by a webcam:
 *  - x increases left → right
 *  - y increases top  → bottom
 *  - z is depth (negative = closer to camera)
 *
 * Only a subset is templated here; everything else falls back to a generic
 * "open hand" template. The training notebook produces a fully-fledged
 * CNN/LSTM classifier that supersedes these templates.
 */

const OPEN_HAND: Pose = [
  [0.5, 0.9, 0], // 0 wrist
  [0.45, 0.85, 0], // 1 thumb cmc
  [0.4, 0.8, 0],
  [0.36, 0.74, 0],
  [0.33, 0.68, 0],
  [0.48, 0.7, 0], // 5 index mcp
  [0.47, 0.55, 0],
  [0.46, 0.45, 0],
  [0.45, 0.38, 0],
  [0.5, 0.7, 0], // 9 middle mcp
  [0.5, 0.5, 0],
  [0.5, 0.4, 0],
  [0.5, 0.32, 0],
  [0.53, 0.71, 0], // 13 ring mcp
  [0.54, 0.55, 0],
  [0.55, 0.45, 0],
  [0.56, 0.4, 0],
  [0.57, 0.73, 0], // 17 pinky mcp
  [0.59, 0.6, 0],
  [0.6, 0.52, 0],
  [0.62, 0.45, 0],
];

const A_FIST: Pose = [
  [0.5, 0.9, 0],
  [0.42, 0.85, 0],
  [0.38, 0.78, 0],
  [0.36, 0.74, 0],
  [0.36, 0.7, 0],
  [0.46, 0.75, 0],
  [0.47, 0.78, 0],
  [0.48, 0.76, 0],
  [0.49, 0.74, 0],
  [0.5, 0.74, 0],
  [0.51, 0.78, 0],
  [0.51, 0.76, 0],
  [0.51, 0.74, 0],
  [0.53, 0.74, 0],
  [0.54, 0.78, 0],
  [0.54, 0.76, 0],
  [0.54, 0.74, 0],
  [0.56, 0.74, 0],
  [0.58, 0.78, 0],
  [0.58, 0.76, 0],
  [0.58, 0.74, 0],
];

const B_FLAT: Pose = [
  [0.5, 0.95, 0],
  [0.42, 0.85, 0],
  [0.42, 0.78, 0],
  [0.45, 0.74, 0],
  [0.48, 0.74, 0],
  [0.45, 0.72, 0],
  [0.45, 0.55, 0],
  [0.45, 0.42, 0],
  [0.45, 0.32, 0],
  [0.5, 0.72, 0],
  [0.5, 0.55, 0],
  [0.5, 0.42, 0],
  [0.5, 0.32, 0],
  [0.55, 0.72, 0],
  [0.55, 0.55, 0],
  [0.55, 0.42, 0],
  [0.55, 0.32, 0],
  [0.6, 0.72, 0],
  [0.6, 0.55, 0],
  [0.6, 0.42, 0],
  [0.6, 0.32, 0],
];

const C_CURVE: Pose = [
  [0.5, 0.9, 0],
  [0.42, 0.75, 0],
  [0.38, 0.65, 0],
  [0.38, 0.55, 0],
  [0.42, 0.48, 0],
  [0.5, 0.72, 0],
  [0.45, 0.6, 0],
  [0.43, 0.5, 0],
  [0.44, 0.42, 0],
  [0.55, 0.72, 0],
  [0.5, 0.6, 0],
  [0.48, 0.5, 0],
  [0.5, 0.42, 0],
  [0.6, 0.72, 0],
  [0.55, 0.6, 0],
  [0.53, 0.5, 0],
  [0.55, 0.42, 0],
  [0.62, 0.74, 0],
  [0.58, 0.62, 0],
  [0.56, 0.55, 0],
  [0.58, 0.48, 0],
];

const I_PINKY: Pose = [
  [0.5, 0.9, 0],
  [0.42, 0.85, 0],
  [0.4, 0.8, 0],
  [0.4, 0.78, 0],
  [0.4, 0.76, 0],
  [0.46, 0.78, 0],
  [0.46, 0.76, 0],
  [0.46, 0.74, 0],
  [0.46, 0.72, 0],
  [0.5, 0.78, 0],
  [0.5, 0.76, 0],
  [0.5, 0.74, 0],
  [0.5, 0.72, 0],
  [0.54, 0.78, 0],
  [0.54, 0.76, 0],
  [0.54, 0.74, 0],
  [0.54, 0.72, 0],
  [0.58, 0.75, 0],
  [0.6, 0.6, 0],
  [0.62, 0.5, 0],
  [0.64, 0.42, 0],
];

const L_LSHAPE: Pose = [
  [0.5, 0.9, 0],
  [0.42, 0.82, 0],
  [0.32, 0.78, 0],
  [0.24, 0.76, 0],
  [0.18, 0.76, 0],
  [0.48, 0.7, 0],
  [0.48, 0.55, 0],
  [0.48, 0.42, 0],
  [0.48, 0.3, 0],
  [0.5, 0.74, 0],
  [0.5, 0.76, 0],
  [0.5, 0.78, 0],
  [0.5, 0.8, 0],
  [0.54, 0.74, 0],
  [0.54, 0.76, 0],
  [0.54, 0.78, 0],
  [0.54, 0.8, 0],
  [0.58, 0.74, 0],
  [0.58, 0.76, 0],
  [0.58, 0.78, 0],
  [0.58, 0.8, 0],
];

const V_PEACE: Pose = [
  [0.5, 0.9, 0],
  [0.42, 0.82, 0],
  [0.4, 0.78, 0],
  [0.4, 0.76, 0],
  [0.4, 0.74, 0],
  [0.46, 0.7, 0],
  [0.42, 0.55, 0],
  [0.4, 0.42, 0],
  [0.38, 0.3, 0],
  [0.5, 0.7, 0],
  [0.54, 0.55, 0],
  [0.56, 0.42, 0],
  [0.58, 0.3, 0],
  [0.54, 0.74, 0],
  [0.54, 0.76, 0],
  [0.54, 0.78, 0],
  [0.54, 0.8, 0],
  [0.58, 0.74, 0],
  [0.58, 0.76, 0],
  [0.58, 0.78, 0],
  [0.58, 0.8, 0],
];

const Y_HANGLOOSE: Pose = [
  [0.5, 0.9, 0],
  [0.4, 0.82, 0],
  [0.3, 0.74, 0],
  [0.22, 0.66, 0],
  [0.18, 0.6, 0],
  [0.46, 0.74, 0],
  [0.46, 0.76, 0],
  [0.46, 0.78, 0],
  [0.46, 0.8, 0],
  [0.5, 0.74, 0],
  [0.5, 0.76, 0],
  [0.5, 0.78, 0],
  [0.5, 0.8, 0],
  [0.54, 0.74, 0],
  [0.54, 0.76, 0],
  [0.54, 0.78, 0],
  [0.54, 0.8, 0],
  [0.58, 0.74, 0],
  [0.62, 0.6, 0],
  [0.66, 0.48, 0],
  [0.7, 0.4, 0],
];

const TEMPLATES: Record<string, Pose> = {
  A: A_FIST,
  B: B_FLAT,
  C: C_CURVE,
  I: I_PINKY,
  L: L_LSHAPE,
  V: V_PEACE,
  Y: Y_HANGLOOSE,
};

const FALLBACK = OPEN_HAND;

/**
 * Build a normalised feature template for a given label. If the label is not
 * one of the hand-tuned templates we fall back to an "open hand" pose so the
 * UI still produces a meaningful similarity score (the user just won't get a
 * perfect match until they train the real model).
 */
export function templateFor(label: string): Float32Array {
  const key = label.toUpperCase();
  const points = TEMPLATES[key] ?? FALLBACK;
  if (points.length !== LANDMARK_COUNT) {
    throw new Error(`Template for ${label} has wrong length: ${points.length}`);
  }
  return normaliseLandmarks(pose(points));
}

export const TEMPLATE_LABELS = Object.keys(TEMPLATES);

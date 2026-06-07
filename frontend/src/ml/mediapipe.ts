/**
 * MediaPipe Hands wrapper.
 *
 * Loads the HandLandmarker WASM bundle from a public CDN (jsDelivr) so the
 * frontend does not need to bundle the ~3 MB asset itself. The detector runs
 * fully on-device — no images leave the browser, which is important for both
 * latency and privacy.
 */

import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

const WASM_BASE =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

let detectorPromise: Promise<HandLandmarker> | null = null;

export async function getHandLandmarker(): Promise<HandLandmarker> {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);
      return HandLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
    })().catch((err) => {
      detectorPromise = null;
      throw err;
    });
  }
  return detectorPromise;
}

/** Disposes the cached detector. Call on logout/unmount to free GPU memory. */
export function disposeHandLandmarker(): void {
  if (detectorPromise) {
    detectorPromise
      .then((det) => det.close())
      .catch(() => {
        /* best effort */
      });
    detectorPromise = null;
  }
}

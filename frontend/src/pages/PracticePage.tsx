import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Camera, CheckCircle2, Loader2, Pause, Play } from "lucide-react";

import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

import { Card } from "@/components/Card";
import { apiRequest } from "@/lib/api";
import type { LessonDetail, Sign } from "@/lib/types";
import { disposeHandLandmarker, getHandLandmarker } from "@/ml/mediapipe";
import { recognizeDynamic, recognizeStatic, type RecognitionResult } from "@/ml/recognizer";
import { useAuth } from "@/state/auth";

const DYNAMIC_BUFFER_SIZE = 30;
const STATIC_HOLD_FRAMES = 8;
const STATIC_SUCCESS_THRESHOLD = 0.78;
const DYNAMIC_SUCCESS_THRESHOLD = 0.7;

type Status = "idle" | "requesting" | "running" | "error" | "paused";

interface PracticeBufferRefs {
  dynamic: NormalizedLandmark[][];
  holdCount: number;
}

export function PracticePage(): JSX.Element {
  const { slug = "" } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [statusMsg, setStatusMsg] = useState("Tekan tombol untuk menyalakan kamera.");
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [mastered, setMastered] = useState<Set<number>>(new Set());

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const buffersRef = useRef<PracticeBufferRefs>({ dynamic: [], holdCount: 0 });
  const lastRecognitionRef = useRef(0);

  const activeSign: Sign | null = lesson?.signs[activeIdx] ?? null;
  const candidateLabels = useMemo(
    () => (lesson?.signs.map((s) => s.label) ?? []) as string[],
    [lesson],
  );

  useEffect(() => {
    let cancelled = false;
    apiRequest<LessonDetail>(`/api/lessons/${slug}`, { auth: false })
      .then((res) => {
        if (!cancelled) setLesson(res);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Gagal memuat pelajaran.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const recordProgress = useCallback(
    async (sign: Sign, score: number, correct: boolean) => {
      if (!user) return;
      try {
        await apiRequest("/api/progress", {
          method: "POST",
          body: { sign_id: sign.id, score, correct },
        });
        if (correct) {
          setMastered((prev) => {
            const next = new Set(prev);
            next.add(sign.id);
            return next;
          });
        }
      } catch {
        /* progress is best-effort */
      }
    },
    [user],
  );

  const drawOverlay = useCallback(
    (landmarks: NormalizedLandmark[] | null) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!landmarks) return;
      ctx.fillStyle = "#58cc02";
      ctx.strokeStyle = "#ffd84f";
      ctx.lineWidth = 2;
      for (const point of landmarks) {
        ctx.beginPath();
        ctx.arc(point.x * canvas.width, point.y * canvas.height, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [],
  );

  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    buffersRef.current = { dynamic: [], holdCount: 0 };
  }, []);

  const startCamera = useCallback(async () => {
    if (!lesson) return;
    setStatus("requesting");
    setStatusMsg("Meminta izin kamera…");
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("Element video tidak siap.");
      video.srcObject = stream;
      await video.play();

      setStatus("running");
      setStatusMsg("Kamera aktif. Tunjukkan isyarat di depan kamera.");

      const detector = await getHandLandmarker();

      const loop = async () => {
        if (status === "paused") return;
        const v = videoRef.current;
        if (!v || v.readyState < 2) {
          rafRef.current = requestAnimationFrame(() => void loop());
          return;
        }
        const ts = performance.now();
        const det = detector.detectForVideo(v, ts);
        const handLandmarks = det.landmarks?.[0] ?? null;
        drawOverlay(handLandmarks);

        if (lesson.is_dynamic) {
          if (handLandmarks) {
            buffersRef.current.dynamic.push(handLandmarks);
            if (buffersRef.current.dynamic.length > DYNAMIC_BUFFER_SIZE) {
              buffersRef.current.dynamic.shift();
            }
          } else if (buffersRef.current.dynamic.length > 0) {
            // No hand detected: gracefully drain the buffer so an idle frame
            // doesn't accidentally trigger a recognition burst.
            buffersRef.current.dynamic.shift();
          }
          if (
            buffersRef.current.dynamic.length === DYNAMIC_BUFFER_SIZE &&
            ts - lastRecognitionRef.current > 1500
          ) {
            lastRecognitionRef.current = ts;
            const target = lesson.signs[activeIdx];
            if (target) {
              const res = await recognizeDynamic(
                buffersRef.current.dynamic,
                candidateLabels,
              );
              setResult(res);
              const correct =
                res.label.toLowerCase() === target.label.toLowerCase() &&
                res.score >= DYNAMIC_SUCCESS_THRESHOLD;
              await recordProgress(target, res.score, correct);
              if (correct) {
                buffersRef.current.dynamic = [];
                setStatusMsg(`Bagus! Isyarat "${target.label}" dikenali.`);
              }
            }
          }
        } else if (handLandmarks) {
          const target = lesson.signs[activeIdx];
          if (target) {
            const res = await recognizeStatic(handLandmarks, candidateLabels);
            setResult(res);
            const correct =
              res.label.toLowerCase() === target.label.toLowerCase() &&
              res.score >= STATIC_SUCCESS_THRESHOLD;
            if (correct) {
              buffersRef.current.holdCount += 1;
              if (buffersRef.current.holdCount >= STATIC_HOLD_FRAMES) {
                buffersRef.current.holdCount = 0;
                await recordProgress(target, res.score, true);
                setStatusMsg(`Bagus! Isyarat "${target.label}" dikenali.`);
              }
            } else {
              buffersRef.current.holdCount = 0;
            }
          }
        }

        rafRef.current = requestAnimationFrame(() => void loop());
      };
      rafRef.current = requestAnimationFrame(() => void loop());
    } catch (err) {
      stopCamera();
      setStatus("error");
      const msg = err instanceof Error ? err.message : "Tidak dapat mengakses kamera.";
      setStatusMsg(msg);
    }
  }, [activeIdx, candidateLabels, drawOverlay, lesson, recordProgress, status, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
      disposeHandLandmarker();
    };
  }, [stopCamera]);

  // Reset hold buffers when the active sign changes.
  useEffect(() => {
    buffersRef.current = { dynamic: [], holdCount: 0 };
    setResult(null);
  }, [activeIdx]);

  if (loadError) {
    return (
      <div role="alert" className="space-y-4">
        <h1 className="text-2xl font-bold">Pelajaran tidak ditemukan</h1>
        <p>{loadError}</p>
        <Link to="/lessons" className="font-semibold">
          Kembali ke daftar pelajaran
        </Link>
      </div>
    );
  }

  if (!lesson) {
    return (
      <p role="status" aria-live="polite">
        Memuat pelajaran…
      </p>
    );
  }

  const score = result?.score ?? 0;
  const targetLabel = activeSign?.label ?? "?";

  return (
    <div className="space-y-6">
      <header className="animate-fade-up">
        <span
          className={[
            "chip mb-2",
            lesson.is_dynamic ? "chip-accent" : "chip-brand",
          ].join(" ")}
        >
          Latihan {lesson.is_dynamic ? "dinamis (LSTM)" : "statis (CNN)"}
        </span>
        <h1 className="text-3xl font-extrabold">{lesson.title}</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card ariaLabelledBy="practice-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="practice-heading" className="text-xl font-semibold">
              Kamera latihan
            </h2>
            <div
              role="status"
              aria-live="polite"
              className="text-sm text-[var(--color-fg-muted)]"
            >
              {statusMsg}
            </div>
          </div>

          <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border-2 border-[var(--color-border)]">
            <video
              ref={videoRef}
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
              aria-label="Tampilan kamera Anda"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1]"
              aria-hidden="true"
            />
            {status !== "running" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white">
                {status === "requesting" ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="animate-spin" aria-hidden="true" />
                    Menyiapkan kamera…
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Camera aria-hidden="true" /> Kamera belum aktif
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 items-center">
            {status === "running" ? (
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setStatus("idle");
                  setStatusMsg("Kamera dimatikan.");
                }}
                className="btn-pop btn-pop-secondary"
              >
                <Pause aria-hidden="true" size={16} /> Matikan kamera
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void startCamera()}
                className="btn-pop btn-pop-primary"
              >
                <Play aria-hidden="true" size={16} /> Nyalakan kamera
              </button>
            )}
            {!user && (
              <p className="text-sm text-[var(--color-fg-muted)]">
                <Link to="/login" className="font-bold">
                  Masuk
                </Link>{" "}
                untuk menyimpan kemajuan latihan Anda.
              </p>
            )}
          </div>

          <div className="mt-6">
            <p className="text-sm">
              Target: <strong>{targetLabel}</strong>
            </p>
            <p className="text-sm">
              Hasil saat ini:{" "}
              <strong>{result ? result.label : "—"}</strong>{" "}
              <span className="text-[var(--color-fg-muted)]">
                ({result ? `${(score * 100).toFixed(0)}%` : "0%"})
              </span>{" "}
              <span className="text-xs text-[var(--color-fg-muted)]">
                {result ? `sumber: ${result.source}` : ""}
              </span>
            </p>
            <div
              role="progressbar"
              aria-valuenow={Math.round(score * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Skor pengenalan untuk ${targetLabel}`}
              className="mt-2 h-3 rounded-full bg-[var(--color-bg-subtle)] border-2 border-[var(--color-border)] overflow-hidden"
            >
              <div
                style={{ width: `${score * 100}%` }}
                className="h-full bg-brand-500 transition-[width] duration-200"
              />
            </div>
          </div>
        </Card>

        <Card ariaLabelledBy="signs-list">
          <h2 id="signs-list" className="text-xl font-semibold mb-3">
            Daftar isyarat
          </h2>
          <ol className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
            {lesson.signs.map((sign, idx) => {
              const isActive = idx === activeIdx;
              const isMastered = mastered.has(sign.id);
              return (
                <li key={sign.id}>
                  <button
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    aria-current={isActive ? "step" : undefined}
                    className={[
                      "w-full text-left px-3 py-2 rounded-2xl flex items-center gap-2 border-2 transition-colors",
                      isActive
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-900/40"
                        : "border-transparent hover:bg-[var(--color-bg-subtle)]",
                    ].join(" ")}
                  >
                    <span
                      aria-hidden="true"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-brand-500 text-white text-sm font-extrabold"
                    >
                      {sign.label.slice(0, 2)}
                    </span>
                    <span className="flex-1 font-bold">{sign.label}</span>
                    {isMastered && (
                      <CheckCircle2
                        aria-label="dikuasai"
                        size={18}
                        className="text-brand-600"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        </Card>
      </div>

      {activeSign && (
        <Card ariaLabelledBy="active-sign-heading">
          <h2 id="active-sign-heading" className="text-xl font-semibold mb-2">
            Cara melakukan: {activeSign.label}
          </h2>
          <div className="grid gap-4 sm:grid-cols-[1fr,2fr]">
            <img
              src={activeSign.image_url}
              alt={activeSign.image_alt}
              className="w-full rounded-2xl border-2 border-[var(--color-border)]"
            />
            <div className="space-y-2 text-sm">
              <p>
                <strong>Deskripsi:</strong> {activeSign.description}
              </p>
              <p>
                <strong>Tips:</strong> {activeSign.instructions}
              </p>
              <p className="text-[var(--color-fg-muted)]">
                {lesson.is_dynamic
                  ? `Tahan kamera dan lakukan gerakan utuh. Sistem akan menganalisa ${DYNAMIC_BUFFER_SIZE} frame terakhir.`
                  : `Tahan isyarat selama beberapa detik di depan kamera (skor ≥ ${Math.round(
                      STATIC_SUCCESS_THRESHOLD * 100,
                    )}%).`}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

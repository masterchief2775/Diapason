import { useEffect, useRef, useState } from "react";
import { detectPitch, freqToDetected, type DetectedNote } from "./pitch";

/**
 * Micro temps réel : AnalyserNode + détection à chaque frame.
 * Stabilise : une note n'est émise que si elle tient ~160 ms.
 */

export type MicState = "idle" | "starting" | "live" | "denied" | "missing";

export function useMic(onStable?: (note: DetectedNote) => void) {
  const [state, setState] = useState<MicState>("idle");
  const [live, setLive] = useState<DetectedNote | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const cbRef = useRef(onStable);
  cbRef.current = onStable;

  useEffect(() => () => stopRef.current?.(), []);

  const start = async () => {
    if (stopRef.current) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setState("missing");
      return;
    }
    setState("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      if (ctx.state === "suspended") await ctx.resume();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      src.connect(analyser);
      const buf = new Float32Array(analyser.fftSize);

      let raf = 0;
      let candidate: DetectedNote | null = null;
      let candidateSince = 0;
      let lastEmit = 0;
      const loop = () => {
        analyser.getFloatTimeDomainData(buf);
        const hit = detectPitch(buf, ctx.sampleRate);
        const note = hit ? freqToDetected(hit.freq, hit.clarity) : null;
        setLive(note);
        const now = performance.now();
        if (note && note.clarity > 0.75) {
          if (!candidate || candidate.midi !== note.midi) {
            candidate = note;
            candidateSince = now;
          } else if (now - candidateSince > 160 && now - lastEmit > 500) {
            lastEmit = now;
            cbRef.current?.(note);
          }
        } else {
          candidate = null;
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      setState("live");

      stopRef.current = () => {
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((t) => t.stop());
        void ctx.close();
        stopRef.current = null;
      };
    } catch {
      setState("denied");
    }
  };

  const stop = () => {
    stopRef.current?.();
    setState("idle");
    setLive(null);
  };

  return { state, live, start, stop };
}

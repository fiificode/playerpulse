"use client";

import { useCallback, useRef } from "react";
import { useVoteStore } from "@/store/useVoteStore";

let sharedContext: AudioContext | null = null;

export function useUiTick() {
  const soundEnabled = useVoteStore((state) => state.soundEnabled);
  const lastTickRef = useRef(0);

  const playTick = useCallback(() => {
    if (!soundEnabled || typeof window === "undefined") return;

    const now = performance.now();
    if (now - lastTickRef.current < 80) return;
    lastTickRef.current = now;

    try {
      const AudioCtx =
        window.AudioContext || (window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!sharedContext) {
        sharedContext = new AudioCtx();
      }

      const ctx = sharedContext;
      if (ctx.state === "suspended") {
        void ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.value = 820;
      gain.gain.value = 0.05;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {
      // ignore audio errors
    }
  }, [soundEnabled]);

  return { playTick };
}

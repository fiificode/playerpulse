"use client";

import { motion } from "framer-motion";
import { ArrowDownRight } from "lucide-react";
import { useUiTick } from "./useUiTick";

type HeroProps = {
  onStartVoting: () => void;
};

export function Hero({ onStartVoting }: HeroProps) {
  const { playTick } = useUiTick();

  return (
    <section className="relative flex flex-col items-center justify-center gap-6 py-12 text-center md:py-20">
      <motion.h1
        className="bg-linear-to-r from-indigo-300 via-purple-400 to-sky-400 bg-clip-text text-4xl font-semibold tracking-tight text-transparent md:text-5xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        Vote for the Player of the Week
      </motion.h1>
      <motion.p
        className="max-w-xl text-balance text-base text-slate-300 md:text-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
      >
        Pick your standout star, watch the live leaderboard shuffle in real
        time, and unlock a stadium-style celebration when you cast your vote.
      </motion.p>
      <motion.button
        type="button"
        onClick={onStartVoting}
        onPointerDown={playTick}
        onMouseEnter={playTick}
        className="group relative mt-2 inline-flex items-center gap-2 rounded-full border border-sky-400/70 bg-sky-500/20 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-sky-100 shadow-[0_0_25px_rgba(56,189,248,0.5)] transition hover:border-sky-300 hover:bg-sky-400/30 hover:shadow-[0_0_40px_rgba(56,189,248,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      >
        <span>Start Voting</span>
        <ArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
        <span className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-sky-500/40 blur-xl" />
      </motion.button>
    </section>
  );
}

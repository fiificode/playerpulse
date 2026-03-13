"use client";

import { motion } from "framer-motion";
import type { Player } from "@/types/player";

type WinnerBannerProps = {
  winner: Player;
};

const colors = ["#38bdf8", "#a855f7", "#22c55e", "#f97316", "#eab308"];

export function WinnerBanner({ winner }: WinnerBannerProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-400/80 bg-linear-to-br from-amber-500/20 via-slate-950 to-slate-950 p-5 shadow-[0_0_50px_rgba(251,191,36,0.9)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 18 }).map((_, index) => (
          <motion.span
            key={index}
            className="absolute h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: colors[index % colors.length],
              left: `${(index * 17) % 100}%`,
            }}
            initial={{
              y: -20,
              opacity: 0,
              scale: 0.7,
            }}
            animate={{
              y: [ -20, 120 ],
              opacity: [0, 1, 0],
              scale: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2.4,
              delay: index * 0.06,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative flex flex-col gap-2"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">
          Voting closed
        </p>
        <h2 className="text-lg font-semibold text-amber-50">
          Player of the Week: {winner.name}
        </h2>
        <p className="text-xs text-amber-100">
          {winner.club} • {winner.position}
        </p>
        <p className="mt-1 text-xs text-amber-100/90">
          Final votes:{" "}
          <span className="font-semibold text-amber-50">{winner.votes}</span>
        </p>
      </motion.div>
    </section>
  );
}


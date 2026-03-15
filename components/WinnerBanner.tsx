"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { Player } from "@/types/player";

type WinnerBannerProps = {
  winner: Player;
};

const colors = ["#38bdf8", "#a855f7", "#22c55e", "#f97316", "#eab308"];

export function WinnerBanner({ winner }: WinnerBannerProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-400/80 bg-linear-to-br from-amber-500/20 via-slate-950 to-slate-950 p-5 shadow-[0_0_50px_rgba(251,191,36,0.9)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 22 }).map((_, index) => (
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
              y: [-20, 95],
              opacity: [0, 1, 0],
              scale: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.35,
              delay: index * 0.035,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative flex flex-col gap-4 sm:grid sm:grid-cols-[auto_1fr]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200 sm:hidden">
          Voting closed
        </p>
        <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-amber-300/60 bg-amber-200/10 shadow-[0_0_25px_rgba(251,191,36,0.55)]">
          <Image
            src={winner.image}
            alt={winner.name}
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="hidden text-xs font-semibold uppercase tracking-[0.3em] text-amber-200 sm:block">
            Voting closed
          </p>
          <h2 className="text-lg font-semibold text-amber-50">
            Player of the Week: {winner.name}
          </h2>
          <p className="text-xs text-amber-100">
            {winner.club} • {winner.position}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-amber-100/90">
            <span className="rounded-full border border-amber-300/40 bg-amber-400/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-100">
              Final votes
            </span>
            <span className="font-semibold text-amber-50">{winner.votes}</span>
            <span className="text-amber-100/70">•</span>
            <span className="text-amber-100/90">Top fan XP bonus</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

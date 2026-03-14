"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { Player } from "@/types/player";

type PlayerStatsModalProps = {
  player: Player;
  onClose: () => void;
};

const statLabels: Array<{
  key: keyof Player["stats"];
  label: string;
  suffix?: string;
}> = [
  { key: "goals", label: "Goals" },
  { key: "assists", label: "Assists" },
  { key: "keyPasses", label: "Key Passes" },
  { key: "shotsOnTarget", label: "Shots on Target" },
  { key: "passAccuracy", label: "Pass Accuracy", suffix: "%" },
  { key: "tackles", label: "Tackles" },
];

export function PlayerStatsModal({ player, onClose }: PlayerStatsModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 px-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${player.name} stats`}
    >
      <motion.div
        className="relative w-full max-w-xl rounded-3xl border border-slate-700/80 bg-slate-950/95 p-6 shadow-[0_0_40px_rgba(15,23,42,0.95)]"
        onClick={(event) => event.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 6 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/80 bg-slate-950/90 text-slate-200 shadow-[0_0_16px_rgba(15,23,42,0.85)] transition hover:border-sky-400 hover:text-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          aria-label="Close player stats"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Player Stats
          </p>
          <h2 className="text-2xl font-semibold text-slate-100">
            {player.name}
          </h2>
          <p className="text-sm text-slate-400">
            {player.club} • {player.position}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {statLabels.map((stat) => (
            <div
              key={stat.key}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/70 px-3 py-4 text-center shadow-[0_0_22px_rgba(15,23,42,0.9)]"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                {stat.label}
              </p>
              <p className="mt-2 text-lg font-semibold text-sky-200">
                {player.stats[stat.key]}
                {stat.suffix ?? ""}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

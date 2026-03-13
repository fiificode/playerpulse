"use client";

import { motion } from "framer-motion";
import type { Player } from "@/types/player";
import { X } from "lucide-react";
import { WinnerBanner } from "./WinnerBanner";

type WinnerOverlayProps = {
  winner: Player;
  onClose: () => void;
};

export function WinnerOverlay({ winner, onClose }: WinnerOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Player of the Week winner"
    >
      <motion.div
        className="relative z-50 w-full max-w-lg"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -right-2 -top-2 z-50 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/80 bg-slate-950/90 text-slate-200 shadow-[0_0_18px_rgba(15,23,42,0.9)] transition hover:border-sky-400 hover:text-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          aria-label="Close winner announcement"
        >
          <X className="h-4 w-4" />
        </button>
        <WinnerBanner winner={winner} />
      </motion.div>
    </div>
  );
}


"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

type VoteButtonProps = {
  disabled?: boolean;
  hasVoted?: boolean;
  onClick: () => void;
};

export function VoteButton({ disabled, hasVoted, onClick }: VoteButtonProps) {
  const label = hasVoted ? "Voted" : "Vote";

  return (
    <motion.button
      type="button"
      className={`group inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
        hasVoted
          ? "bg-emerald-500/20 text-emerald-200 ring-emerald-400/60 hover:bg-emerald-500/30"
          : "bg-indigo-500/30 text-indigo-50 ring-indigo-400/60 hover:bg-indigo-500/40"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-pressed={hasVoted}
      aria-disabled={disabled}
    >
      {hasVoted ? (
        <Check className="h-4 w-4" />
      ) : (
        <Sparkles className="h-4 w-4 group-hover:rotate-6" />
      )}
      <span>{label}</span>
    </motion.button>
  );
}


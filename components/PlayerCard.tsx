"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Player } from "@/types/player";
import { VoteButton } from "./VoteButton";
import { ProgressBar } from "./ProgressBar";

type PlayerCardProps = {
  player: Player;
  percentage: number;
  isSelected: boolean;
  isDisabled: boolean;
  isCelebrating: boolean;
  onVote: () => void;
};

export function PlayerCard({
  player,
  percentage,
  isSelected,
  isDisabled,
  isCelebrating,
  onVote,
}: PlayerCardProps) {
  return (
    <motion.article
      className={`relative flex flex-col rounded-2xl border border-slate-700/70 bg-slate-900/80 p-4 shadow-[0_0_28px_rgba(15,23,42,0.7)] backdrop-blur-md transition-colors ${
        isSelected
          ? "border-sky-400/70 shadow-[0_0_28px_rgba(56,189,248,0.55)]"
          : "hover:border-indigo-400/70 hover:bg-slate-900"
      }`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -4 }}
    >
      {isCelebrating && (
        <motion.div
          className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-sky-500/20 blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      )}

      <div className="grid grid-cols-[64px_1fr] items-start gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-slate-600/70 bg-slate-800/80">
          <Image
            src={player.image}
            alt={player.name}
            width={64}
            height={64}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex min-h-[72px] flex-col gap-1">
          <h3 className="min-h-[2.5rem] text-base font-semibold leading-tight text-slate-50">
            {player.name}
          </h3>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {player.club} • {player.position}
          </p>
          <p className="text-xs text-slate-400">
            <span className="font-semibold text-sky-300">
              {player.votes}
            </span>{" "}
            votes •{" "}
            <span className="font-semibold text-indigo-300">
              {percentage.toFixed(0)}%
            </span>
          </p>
        </div>
      </div>

      <ProgressBar value={percentage} />

      <div className="mt-4">
        <VoteButton
          hasVoted={isSelected}
          disabled={isDisabled && !isSelected}
          onClick={onVote}
        />
      </div>
    </motion.article>
  );
}

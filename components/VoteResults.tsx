"use client";

import { motion } from "framer-motion";
import type { Player } from "@/types/player";

type VoteResultsProps = {
  players: Player[];
  selectedPlayerId: string | null;
  totalVotes: number;
};

export function VoteResults({
  players,
  selectedPlayerId,
  totalVotes,
}: VoteResultsProps) {
  const selectedPlayer =
    selectedPlayerId != null
      ? (players.find((p) => p.id === selectedPlayerId) ?? null)
      : null;

  if (!selectedPlayer) {
    return (
      <section className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-[0_0_45px_rgba(15,23,42,1)] backdrop-blur-xl">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
          Your pick
        </h2>
        <p className="text-sm text-slate-400">
          Tap a player card to cast your vote and unlock live stats for your
          Player of the Week.
        </p>
      </section>
    );
  }

  const playerVotes = selectedPlayer.votes;
  const percentage =
    totalVotes > 0
      ? (playerVotes / totalVotes) * 100
      : playerVotes > 0
        ? 100
        : 0;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-emerald-400/60 bg-linear-to-br from-emerald-500/15 via-slate-950 to-slate-950 p-5 shadow-[0_0_45px_rgba(16,185,129,0.8)] backdrop-blur-xl">
      <motion.div
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/30 blur-3xl"
        initial={{ opacity: 0.4, scale: 0.9 }}
        animate={{ opacity: 0.7, scale: 1.1 }}
        transition={{ duration: 1.2, repeat: Infinity, repeatType: "mirror" }}
      />
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
        You voted
      </h2>
      <p className="text-sm text-emerald-50">
        <span className="font-semibold">{selectedPlayer.name}</span> currently
        holds <span className="font-semibold">{percentage.toFixed(1)}%</span> of
        all votes.
      </p>
      <p className="mt-2 text-xs text-emerald-100/80">
        Total votes:{" "}
        <span className="font-semibold text-emerald-50">{totalVotes}</span>
      </p>
    </section>
  );
}

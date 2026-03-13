"use client";

import { motion } from "framer-motion";
import type { Player } from "@/types/player";
import { Crown } from "lucide-react";

type LeaderboardProps = {
  players: Player[];
  totalVotes: number;
};

const rankStyles: Record<
  number,
  { label: string; className: string; iconColor: string }
> = {
  1: {
    label: "Gold",
    className:
      "border-amber-400/80 bg-amber-500/10 shadow-[0_0_40px_rgba(251,191,36,0.7)]",
    iconColor: "text-amber-300",
  },
  2: {
    label: "Silver",
    className:
      "border-slate-200/60 bg-slate-200/5 shadow-[0_0_36px_rgba(226,232,240,0.5)]",
    iconColor: "text-slate-200",
  },
  3: {
    label: "Bronze",
    className:
      "border-orange-400/70 bg-orange-500/10 shadow-[0_0_36px_rgba(251,146,60,0.6)]",
    iconColor: "text-orange-300",
  },
};

export function Leaderboard({ players, totalVotes }: LeaderboardProps) {
  return (
    <section className="mt-10 w-full rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-[0_0_45px_rgba(15,23,42,1)] backdrop-blur-xl md:mt-0 md:w-[380px]">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
          Leaderboard
        </h2>
        <p className="text-xs text-slate-400">
          Total votes:{" "}
          <span className="font-semibold text-sky-300">{totalVotes}</span>
        </p>
      </div>

      <div className="space-y-3">
        {players.map((player, index) => {
          const rank = index + 1;
          const basePercentage =
            totalVotes > 0 ? (player.votes / totalVotes) * 100 : 0;
          const style = rankStyles[rank];

          return (
            <motion.div
              key={player.id}
              className={`relative flex items-center justify-between gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/70 px-3 py-2 text-sm shadow-[0_0_26px_rgba(15,23,42,0.9)] ${
                style ? style.className : ""
              }`}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/80 text-xs font-semibold text-slate-200">
                  {rank}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-50">
                    {player.name}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {player.club}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {style && (
                  <Crown
                    className={`h-4 w-4 ${
                      style.iconColor
                    } ${rank === 1 ? "animate-pulse" : ""}`}
                  />
                )}
                <div className="text-right text-[11px] text-slate-400">
                  <div className="font-semibold text-indigo-200">
                    {player.votes} votes
                  </div>
                  <div>{basePercentage.toFixed(1)}%</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}


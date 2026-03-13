"use client";

import { useCallback, useState } from "react";
import type { Player } from "@/types/player";
import { Link2, Share2 } from "lucide-react";

type ShareWinnerProps = {
  totalVotes: number;
  leader: Player | null;
};

export function ShareWinner({ totalVotes, leader }: ShareWinnerProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = window.location.href;

    if (navigator.share && leader) {
      try {
        await navigator.share({
          title: "PlayerPulse – Player of the Week",
          text: `My pick for Player of the Week is ${leader.name}. Who are you backing?`,
          url,
        });
        return;
      } catch {
        // fall back to copy
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, [leader]);

  if (!leader || totalVotes === 0) {
    return (
      <section className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5 text-sm text-slate-400 shadow-[0_0_40px_rgba(15,23,42,1)] backdrop-blur-xl">
        Share the link once voting heats up to let friends back their Player of
        the Week.
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-sky-500/70 bg-slate-950/90 p-5 text-sm shadow-[0_0_45px_rgba(56,189,248,0.7)] backdrop-blur-xl">
      <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">
        Share winner
      </h2>
      <p className="mb-3 text-xs text-slate-300">
        {leader.name} is leading the pack with{" "}
        <span className="font-semibold text-sky-200">{leader.votes}</span>{" "}
        votes. Send this link so your friends can weigh in.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 rounded-full bg-sky-500/30 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-50 shadow-[0_0_26px_rgba(56,189,248,0.9)] transition hover:bg-sky-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>Share</span>
        </button>
        <div className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/80 px-2 py-1 text-[11px] text-slate-300">
          <Link2 className="h-3.5 w-3.5 text-slate-400" />
          <span className="truncate max-w-[140px] text-slate-400">
            {copied ? "Link copied!" : "Copy link"}
          </span>
        </div>
      </div>
    </section>
  );
}


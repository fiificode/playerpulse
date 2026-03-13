"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { Hero } from "@/components/Hero";
import { PlayerCard } from "@/components/PlayerCard";
import { Leaderboard } from "@/components/Leaderboard";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { useVoteStore } from "@/store/useVoteStore";
import { VoteResults } from "@/components/VoteResults";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ShareWinner } from "@/components/ShareWinner";
import { WinnerBanner } from "@/components/WinnerBanner";

export default function Home() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nomineesRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [votingClosed, setVotingClosed] = useState(false);

  const {
    players,
    selectedPlayerId,
    hasVoted,
    celebrationPlayerId,
    soundEnabled,
    weekDeadline,
    totalVotes,
    vote,
    resetCelebration,
    toggleSound,
    hydrateFromStorage,
  } = useVoteStore();

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => b.votes - a.votes),
    [players],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storageKey = "playerpulse-votes";

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          players?: typeof players;
          totalVotes?: number;
          weekDeadline?: string;
        };
        hydrateFromStorage(parsed);
      }
    } catch {
      // ignore malformed storage
    }

    const unsubscribe = useVoteStore.subscribe((state) => {
      const snapshot = {
        players: state.players,
        totalVotes: state.totalVotes,
        weekDeadline: state.weekDeadline,
      };
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
        } catch {
          // ignore write errors
        }
      });

    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue) as {
          players?: typeof players;
          totalVotes?: number;
          weekDeadline?: string;
        };
        hydrateFromStorage(parsed);
      } catch {
        // ignore malformed updates
      }
    };

    window.addEventListener("storage", onStorage);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  }, [hydrateFromStorage, players]);

  useEffect(() => {
    const deadlineMs = new Date(weekDeadline).getTime();
    const updateClosed = () => {
      setVotingClosed(Date.now() >= deadlineMs);
    };

    updateClosed();
    if (Date.now() >= deadlineMs) {
      return;
    }

    const id = setInterval(updateClosed, 1000);
    return () => clearInterval(id);
  }, [weekDeadline]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    audioRef.current = new Audio("/audio/crowd-cheer.mp3");
  }, []);

  const handleVote = (playerId: string) => {
    if (hasVoted || votingClosed) return;
    vote(playerId);

    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // ignore playback errors (e.g. autoplay restrictions)
      });
    }

    setTimeout(() => {
      resetCelebration();
    }, 1200);
  };

  const handleStartVoting = () => {
    if (!nomineesRef.current) return;
    nomineesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const totalVotesForPercentages = useMemo(
    () =>
      totalVotes > 0
        ? totalVotes
        : players.reduce((sum, p) => sum + p.votes, 0),
    [players, totalVotes],
  );

  const currentLeader = sortedPlayers[0] ?? null;

  return (
    <main
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-slate-950 via-slate-950 to-slate-950 pb-20 text-slate-50"
    >
      <AnimatedBackground />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pt-8 sm:px-6 md:px-8 md:pt-12">
        <header className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300/80">
              PlayerPulse
            </p>
            <h1 className="text-lg font-semibold text-slate-100">
              Player of the Week
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <CountdownTimer deadline={weekDeadline} />
            <button
              type="button"
              onClick={toggleSound}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/80 text-slate-200 shadow-[0_0_16px_rgba(15,23,42,0.8)] transition hover:border-sky-400/80 hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              aria-label={
                soundEnabled ? "Mute crowd audio" : "Unmute crowd audio"
              }
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </button>
          </div>
        </header>

        <Hero onStartVoting={handleStartVoting} />

        <section
          ref={nomineesRef}
          className="mt-4 flex flex-col gap-10 md:mt-2 md:flex-row"
        >
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between gap-2">
              <motion.h2
                className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                Nominees
              </motion.h2>
              <p className="text-[11px] text-slate-400">
                You can only vote once per session.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {players.map((player) => {
                const percentage =
                  totalVotesForPercentages > 0
                    ? (player.votes / totalVotesForPercentages) * 100
                    : 0;
                const isSelected = selectedPlayerId === player.id;

                return (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    percentage={percentage}
                    isSelected={isSelected}
                    isDisabled={hasVoted || votingClosed}
                    isCelebrating={celebrationPlayerId === player.id}
                    onVote={() => handleVote(player.id)}
                  />
                );
              })}
            </div>
          </div>

          <div className="w-full md:w-[360px] lg:w-[380px]">
            <Leaderboard players={sortedPlayers} totalVotes={totalVotes} />
          </div>
        </section>

        <section className="mt-4 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
          {votingClosed && currentLeader ? (
            <>
              <WinnerBanner winner={currentLeader} />
              <ShareWinner totalVotes={totalVotes} leader={currentLeader} />
            </>
          ) : (
            <>
              <VoteResults
                players={players}
                selectedPlayerId={selectedPlayerId}
                totalVotes={totalVotes}
              />
              <ShareWinner totalVotes={totalVotes} leader={currentLeader} />
            </>
          )}
        </section>
      </div>
    </main>
  );
}

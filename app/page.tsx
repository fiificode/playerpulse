"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
import { WinnerOverlay } from "@/components/WinnerOverlay";

export default function Home() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nomineesRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [votingClosed, setVotingClosed] = useState(false);
  const [showWinnerOverlay, setShowWinnerOverlay] = useState(false);
  const [phase, setPhase] = useState<"intro" | "voting" | "leaderboard">(
    "intro",
  );
  const [introCount, setIntroCount] = useState(3);
  const [introReady, setIntroReady] = useState(false);

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

  const previousClosedRef = useRef(false);

  useEffect(() => {
    if (votingClosed && !previousClosedRef.current && sortedPlayers[0]) {
      setShowWinnerOverlay(true);
    }
    previousClosedRef.current = votingClosed;
  }, [votingClosed, sortedPlayers]);

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
    if (phase !== "intro") return;

    let count = 3;
    setIntroCount(count);
    setIntroReady(false);

    const id = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(id);
        setIntroCount(0);
        setIntroReady(true);
      } else {
        setIntroCount(count);
      }
    }, 900);

    return () => clearInterval(id);
  }, [phase]);

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

  useEffect(() => {
    if (phase === "voting" && hasVoted) {
      setPhase("leaderboard");
    }
  }, [hasVoted, phase]);

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
    setPhase("voting");
    // Defer scroll to allow DOM to update with voting phase content
    requestAnimationFrame(() => {
      nomineesRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
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

      {votingClosed && currentLeader && showWinnerOverlay && (
        <WinnerOverlay
          winner={currentLeader}
          onClose={() => setShowWinnerOverlay(false)}
        />
      )}

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

        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.section
              key="intro"
              className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                Matchday Voting
              </p>
              <motion.div
                className="text-7xl font-semibold text-sky-200 md:text-8xl"
                key={`count-${introCount}`}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                {introCount > 0 ? introCount : "GO"}
              </motion.div>
              <p className="max-w-lg text-balance text-sm text-slate-400 md:text-base">
                Get ready to crown the Player of the Week. Cast one vote and
                watch the leaderboard evolve live.
              </p>
              {introReady && (
                <motion.button
                  type="button"
                  onClick={handleStartVoting}
                  className="group relative mt-2 inline-flex items-center gap-2 rounded-full border border-sky-400/70 bg-sky-500/20 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-sky-100 shadow-[0_0_25px_rgba(56,189,248,0.5)] transition hover:border-sky-300 hover:bg-sky-400/30 hover:shadow-[0_0_40px_rgba(56,189,248,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <span>Start Voting</span>
                  <span className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-sky-500/40 blur-xl" />
                </motion.button>
              )}
            </motion.section>
          )}

          {phase === "voting" && (
            <motion.div
              key="voting"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
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
                  <Leaderboard
                    players={sortedPlayers}
                    totalVotes={totalVotes}
                  />
                </div>
              </section>
            </motion.div>
          )}

          {phase === "leaderboard" && (
            <motion.section
              key="leaderboard"
              className="mt-2 grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <div className="space-y-6">
                {votingClosed && currentLeader ? (
                  <WinnerBanner winner={currentLeader} />
                ) : (
                  <VoteResults
                    players={players}
                    selectedPlayerId={selectedPlayerId}
                    totalVotes={totalVotes}
                  />
                )}
                <ShareWinner totalVotes={totalVotes} leader={currentLeader} />
              </div>
              <Leaderboard players={sortedPlayers} totalVotes={totalVotes} />
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

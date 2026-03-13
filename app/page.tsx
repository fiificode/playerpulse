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
  const nomineesRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const writeHandleRef = useRef<number | null>(null);
  const [votingClosed, setVotingClosed] = useState(false);
  const [showWinnerOverlay, setShowWinnerOverlay] = useState(false);
  const [phase, setPhase] = useState<
    "intro" | "voting" | "submitted" | "leaderboard"
  >("intro");
  const [introCount, setIntroCount] = useState(3);
  const [introReady, setIntroReady] = useState(false);
  const [shakeIntro, setShakeIntro] = useState(false);

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

    const scheduleWrite = (snapshot: {
      players: typeof players;
      totalVotes: number;
      weekDeadline: string;
    }) => {
      const existingHandle = writeHandleRef.current;
      if (existingHandle !== null) {
        if (typeof (window as { cancelIdleCallback?: (id: number) => void })
          .cancelIdleCallback === "function") {
          (window as { cancelIdleCallback?: (id: number) => void })
            .cancelIdleCallback?.(existingHandle);
        } else {
          clearTimeout(existingHandle);
        }
      }

      const write = () => {
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
        } catch {
          // ignore write errors
        }
      };

      if (typeof (window as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number })
        .requestIdleCallback === "function") {
        writeHandleRef.current =
          (window as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number })
            .requestIdleCallback?.(write, { timeout: 800 }) ?? null;
      } else {
        writeHandleRef.current = window.setTimeout(write, 180);
      }
    };

    const unsubscribe = useVoteStore.subscribe((state) => {
      scheduleWrite({
        players: state.players,
        totalVotes: state.totalVotes,
        weekDeadline: state.weekDeadline,
      });
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
      const handle = writeHandleRef.current;
      if (handle !== null) {
        if (typeof (window as { cancelIdleCallback?: (id: number) => void })
          .cancelIdleCallback === "function") {
          (window as { cancelIdleCallback?: (id: number) => void })
            .cancelIdleCallback?.(handle);
        } else {
          clearTimeout(handle);
        }
        writeHandleRef.current = null;
      }
    };
  }, [hydrateFromStorage]);

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
        setShakeIntro(true);
        const audio = getCrowdAudio();
        if (soundEnabled && audio) {
          audio.currentTime = 0;
          audio.play().catch(() => {
            // ignore playback errors
          });
        }
      } else {
        setIntroCount(count);
        setShakeIntro(true);
      }
    }, 900);

    return () => clearInterval(id);
  }, [phase, soundEnabled]);

  useEffect(() => {
    if (!shakeIntro) return;
    const id = setTimeout(() => setShakeIntro(false), 240);
    return () => clearTimeout(id);
  }, [shakeIntro]);

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

  const getCrowdAudio = () => {
    if (typeof window === "undefined") return null;
    if (!audioRef.current) {
      audioRef.current = new Audio("/audio/crowd-cheer.mp3");
    }
    return audioRef.current;
  };

  useEffect(() => {
    getCrowdAudio();
  }, []);

  useEffect(() => {
    const audio = getCrowdAudio();
    if (!soundEnabled && audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (phase === "voting" && hasVoted) {
      setPhase("submitted");
    }
  }, [hasVoted, phase]);

  useEffect(() => {
    if (phase !== "submitted") return;
    const id = setTimeout(() => setPhase("leaderboard"), 1400);
    return () => clearTimeout(id);
  }, [phase]);

  const handleVote = (playerId: string) => {
    if (hasVoted || votingClosed) return;
    vote(playerId);

    const audio = getCrowdAudio();
    if (soundEnabled && audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {
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
  const crowdEnergy = useMemo(
    () => Math.min(1, totalVotes / 12),
    [totalVotes],
  );
  const stageOrder = ["intro", "voting", "leaderboard"] as const;
  const currentStageIndex = stageOrder.indexOf(
    phase === "submitted" ? "leaderboard" : phase,
  );

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-slate-950 via-slate-950 to-slate-950 pb-20 text-slate-50">
      <AnimatedBackground intensity={crowdEnergy} />

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
            <CountdownTimer
              deadline={weekDeadline}
              active={!votingClosed && phase !== "leaderboard" && phase !== "submitted"}
            />
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
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          {["Intro", "Voting", "Leaderboard"].map((label, index) => {
            const isActive = index === currentStageIndex;
            const isComplete = index < currentStageIndex;
            return (
              <span
                key={label}
                className={`rounded-full border px-3 py-1 transition ${
                  isActive
                    ? "border-sky-400/70 bg-sky-500/15 text-sky-200 shadow-[0_0_14px_rgba(56,189,248,0.6)]"
                    : isComplete
                      ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-200/90"
                      : "border-slate-800/80 bg-slate-950/60"
                }`}
              >
                {label}
              </span>
            );
          })}
        </div>

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
                animate={{
                  scale: 1,
                  opacity: 1,
                  x: shakeIntro ? [0, -8, 8, -6, 6, 0] : 0,
                  rotate: shakeIntro ? [0, -3, 3, -2, 2, 0] : 0,
                }}
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

              <motion.section
                ref={nomineesRef}
                className="mt-4 flex flex-col gap-10 md:mt-2 md:flex-row"
                animate={{
                  boxShadow:
                    !votingClosed && !hasVoted
                      ? [
                          "0 0 0 rgba(56,189,248,0)",
                          "0 0 28px rgba(56,189,248,0.18)",
                          "0 0 0 rgba(56,189,248,0)",
                        ]
                      : "0 0 0 rgba(56,189,248,0)",
                }}
                transition={{
                  duration: 2.4,
                  repeat: !votingClosed && !hasVoted ? Infinity : 0,
                  ease: "easeInOut",
                }}
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
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
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
              </motion.section>
            </motion.div>
          )}

          {phase === "submitted" && (
            <motion.section
              key="submitted"
              className="flex min-h-[50vh] flex-col items-center justify-center gap-6 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <motion.div
                className="h-16 w-16 rounded-full border border-sky-400/70 bg-sky-500/20 shadow-[0_0_40px_rgba(56,189,248,0.7)]"
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    "0 0 25px rgba(56,189,248,0.5)",
                    "0 0 45px rgba(56,189,248,0.85)",
                    "0 0 30px rgba(56,189,248,0.6)",
                  ],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                  Vote Submitted
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-100">
                  Charging the leaderboard...
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Get ready to see the updated rankings.
                </p>
              </div>
            </motion.section>
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

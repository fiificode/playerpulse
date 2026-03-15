"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
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
import { PlayerStatsModal } from "@/components/PlayerStatsModal";
import { UserLeaderboard } from "@/components/UserLeaderboard";
import { fanLeaderboard } from "@/data/userLeaderboard";
import { HighlightsPanel } from "@/components/HighlightsPanel";
import { highlightClips } from "@/data/highlights";

export default function Home() {
  const nomineesRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const writeHandleRef = useRef<number | null>(null);
  const [votingClosed, setVotingClosed] = useState(false);
  const [showWinnerOverlay, setShowWinnerOverlay] = useState(false);
  const [activeStatsPlayer, setActiveStatsPlayer] = useState<string | null>(
    null,
  );
  const [leaderboardMode, setLeaderboardMode] = useState<
    "fans" | "players" | "highlights"
  >("fans");
  const [phase, setPhase] = useState<
    | "intro"
    | "voting"
    | "submitted"
    | "leaderboard"
    | "highlights"
    | "rewards"
    | "spotlight"
  >("intro");
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

    const scheduleWrite = (snapshot: {
      players: typeof players;
      totalVotes: number;
      weekDeadline: string;
    }) => {
      const existingHandle = writeHandleRef.current;
      if (existingHandle !== null) {
        if (
          typeof (window as { cancelIdleCallback?: (id: number) => void })
            .cancelIdleCallback === "function"
        ) {
          (
            window as { cancelIdleCallback?: (id: number) => void }
          ).cancelIdleCallback?.(existingHandle);
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

      if (
        typeof (
          window as {
            requestIdleCallback?: (
              cb: () => void,
              opts?: { timeout: number },
            ) => number;
          }
        ).requestIdleCallback === "function"
      ) {
        writeHandleRef.current =
          (
            window as {
              requestIdleCallback?: (
                cb: () => void,
                opts?: { timeout: number },
              ) => number;
            }
          ).requestIdleCallback?.(write, { timeout: 800 }) ?? null;
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
        if (
          typeof (window as { cancelIdleCallback?: (id: number) => void })
            .cancelIdleCallback === "function"
        ) {
          (
            window as { cancelIdleCallback?: (id: number) => void }
          ).cancelIdleCallback?.(handle);
        } else {
          clearTimeout(handle);
        }
        writeHandleRef.current = null;
      }
    };
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (phase !== "intro") return;
    setIntroReady(true);
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

  const getCrowdAudio = () => {
    if (typeof window === "undefined") return null;
    if (!audioRef.current) {
      audioRef.current = new Audio("/audio/crowd-cheer.mp3");
      audioRef.current.preload = "auto";
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

  const handleToggleSound = () => {
    toggleSound();
  };

  const totalVotesForPercentages = useMemo(
    () =>
      totalVotes > 0
        ? totalVotes
        : players.reduce((sum, p) => sum + p.votes, 0),
    [players, totalVotes],
  );

  const currentLeader = sortedPlayers[0] ?? null;
  const crowdEnergy = useMemo(() => Math.min(1, totalVotes / 12), [totalVotes]);
  const stageOrder = [
    "intro",
    "voting",
    "leaderboard",
    "highlights",
    "rewards",
    "spotlight",
  ] as const;
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
      {activeStatsPlayer &&
        (() => {
          const statsPlayer = players.find(
            (player) => player.id === activeStatsPlayer,
          );
          if (!statsPlayer) return null;
          return (
            <PlayerStatsModal
              player={statsPlayer}
              onClose={() => setActiveStatsPlayer(null)}
            />
          );
        })()}

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pt-8 sm:px-6 md:px-8 md:pt-12">
        <header className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300/80">
              PlayerPulse
            </p>
            <h1 className="text-lg font-semibold text-slate-100">
              Player of the Week
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Independent fan vote • Updated live every round
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:flex-nowrap sm:justify-end">
            <CountdownTimer
              deadline={weekDeadline}
              active={
                !votingClosed &&
                phase !== "leaderboard" &&
                phase !== "submitted"
              }
            />
            <button
              type="button"
              onClick={handleToggleSound}
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
          {(
            ["Intro", "Voting", "Leaderboard", "Highlights", "Rewards"] as const
          ).map((label, index) => {
            const isActive = index === currentStageIndex;
            const isComplete = index < currentStageIndex;
            const nextPhase =
              label === "Intro"
                ? "intro"
                : label === "Voting"
                  ? "voting"
                  : label === "Highlights"
                    ? "highlights"
                    : label === "Rewards"
                      ? "rewards"
                      : "leaderboard";
            const isDisabled = votingClosed && nextPhase === "voting";
            return (
              <button
                key={label}
                type="button"
                onClick={() => {
                  if (isDisabled) return;
                  if (label === "Highlights") {
                    setLeaderboardMode("highlights");
                  }
                  setPhase(nextPhase);
                }}
                className={`rounded-full border px-3 py-1 transition ${
                  isActive
                    ? "border-sky-400/70 bg-sky-500/15 text-sky-200 shadow-[0_0_14px_rgba(56,189,248,0.6)]"
                    : isComplete
                      ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-200/90"
                      : "border-slate-800/80 bg-slate-950/60"
                } ${isDisabled ? "cursor-not-allowed opacity-50" : "hover:border-sky-400/60 hover:text-sky-200"}`}
                aria-current={isActive ? "page" : undefined}
                aria-label={`Go to ${label}`}
              >
                {label}
              </button>
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
                className="text-4xl font-semibold text-sky-200 md:text-6xl"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                {votingClosed ? "Votes ended" : "Cast your vote"}
              </motion.div>
              <p className="max-w-lg text-balance text-sm text-slate-400 md:text-base">
                {votingClosed
                  ? "Voting has closed for this round. View the final leaderboard and see who took the crown."
                  : "Pick a standout player, cast one vote, and track the live leaderboard in real time."}
              </p>
              <button
                type="button"
                onClick={() => setPhase("spotlight")}
                className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/60 text-left shadow-[0_0_45px_rgba(15,23,42,0.9)] transition hover:border-sky-400/60"
              >
                <div className="absolute inset-0 bg-linear-to-br from-sky-500/10 via-transparent to-indigo-500/10" />
                <Image
                  src="/assets/players/haaland.jpg"
                  alt="Matchday spotlight"
                  width={960}
                  height={540}
                  className="relative h-48 w-full object-cover sm:h-60"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 cursor-pointer rounded-full border border-slate-700/80 bg-slate-950/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-200">
                  Matchday Spotlight
                </div>
              </button>
              <div className="grid w-full max-w-3xl gap-4 text-left sm:grid-cols-2">
                <section className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 shadow-[0_0_30px_rgba(15,23,42,0.9)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                    What It Is
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    PlayerPulse lets fans vote for Player of the Week, earn XP
                    for participation, and climb the fan leaderboard.
                  </p>
                </section>
                <section className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 shadow-[0_0_30px_rgba(56,189,248,0.25)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">
                    Earn XP Daily
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-200">
                    <li>Vote on matchdays</li>
                    <li>Return streaks (+XP)</li>
                    <li>Share to gain XP</li>
                    <li>Watch highlight clips</li>
                    <li>Predict the winner</li>
                    <li>React to match moments</li>
                  </ul>
                </section>
                <section className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
                    How It Works
                  </p>
                  <p className="mt-2 text-sm text-slate-200">
                    Voting closes when the timer ends and the winning player is
                    revealed. Fan rankings keep updating with engagement.
                  </p>
                </section>
                <section className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 shadow-[0_0_30px_rgba(251,191,36,0.25)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200">
                    Rewards
                  </p>
                  <p className="mt-2 text-sm text-slate-200">
                    Active fans are entered into monthly prize draws for
                    matchday tickets and signed merch.
                  </p>
                </section>
              </div>
              <div className="flex flex-col items-center gap-2 text-xs text-slate-400">
                {!votingClosed && (
                  <span className="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-3 py-1 text-emerald-200">
                    Vote to enter the monthly ticket raffle
                  </span>
                )}
                <span className="rounded-full border border-slate-800/80 bg-slate-950/70 px-3 py-1">
                  1 vote per session • Live leaderboard • Rewards on the line
                </span>
                <span className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  {votingClosed
                    ? "View the final leaderboard"
                    : "Start voting or view the leaderboard"}
                </span>
              </div>
              {introReady && (
                <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
                  {!votingClosed && (
                    <motion.button
                      type="button"
                      onClick={handleStartVoting}
                      className="group relative inline-flex items-center gap-2 rounded-full border border-sky-400/70 bg-sky-500/20 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-sky-100 shadow-[0_0_25px_rgba(56,189,248,0.5)] transition hover:border-sky-300 hover:bg-sky-400/30 hover:shadow-[0_0_40px_rgba(56,189,248,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      <span>Start Voting</span>
                      <span className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-sky-500/40 blur-xl" />
                    </motion.button>
                  )}
                  <motion.button
                    type="button"
                    onClick={() => setPhase("leaderboard")}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-950/70 px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200 transition hover:border-sky-400/70 hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
                  >
                    View Leaderboard
                  </motion.button>
                </div>
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
                          onStats={() => setActiveStatsPlayer(player.id)}
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
                {!votingClosed && !hasVoted && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-800/80 bg-slate-950/70 px-5 py-4 shadow-[0_0_35px_rgba(15,23,42,0.95)]">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                        Voting open
                      </p>
                      <p className="mt-1 text-sm text-slate-300">
                        Jump back in to make your pick.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleStartVoting}
                      className="inline-flex items-center justify-center rounded-full border border-sky-400/70 bg-sky-500/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100 transition hover:border-sky-300 hover:bg-sky-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    >
                      Back to Voting
                    </button>
                  </div>
                )}
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

                <section className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-[0_0_45px_rgba(15,23,42,1)] backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                        Weekly Raffle
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-slate-100">
                        Pick the winner, win tickets
                      </h3>
                    </div>
                    <span className="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                      New
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-400">
                    If your choice wins, you&apos;re entered into a raffle for a
                    pair of matchday tickets. Winners announced monthly.
                  </p>
                </section>
                <section className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5 shadow-[0_0_40px_rgba(15,23,42,0.95)]">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                      Rewards Won
                    </h3>
                    <span className="text-xs text-slate-500">
                      Last 4 months
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { month: "February", reward: "2x VIP tickets" },
                      { month: "January", reward: "Signed jersey raffle" },
                      {
                        month: "December",
                        reward: "Matchday hospitality pass",
                      },
                      { month: "November", reward: "Training ground tour" },
                    ].map((item) => (
                      <div
                        key={item.month}
                        className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 px-4 py-3 text-sm"
                      >
                        <span className="text-slate-200">{item.month}</span>
                        <span className="text-slate-400">{item.reward}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  {[
                    { id: "fans", label: "Fan XP" },
                    { id: "players", label: "Player Rankings" },
                  ].map((tab) => {
                    const isActive = leaderboardMode === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() =>
                          setLeaderboardMode(
                            tab.id as "fans" | "players" | "highlights",
                          )
                        }
                        className={`rounded-full border px-3 py-1 transition ${
                          isActive
                            ? "border-sky-400/70 bg-sky-500/15 text-sky-200 shadow-[0_0_14px_rgba(56,189,248,0.6)]"
                            : "border-slate-800/80 bg-slate-950/60 hover:border-sky-400/60 hover:text-sky-200"
                        }`}
                        aria-pressed={isActive}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
                {leaderboardMode === "fans" && (
                  <UserLeaderboard fans={fanLeaderboard} />
                )}
                {leaderboardMode === "players" && (
                  <Leaderboard players={sortedPlayers} totalVotes={totalVotes} />
                )}
                <section className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-[0_0_45px_rgba(15,23,42,1)] backdrop-blur-xl">
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                      Fan Level
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-100">
                      Club Captain
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      You&apos;re 72% toward the next tier.
                    </p>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full w-[72%] rounded-full bg-linear-to-r from-sky-400 via-indigo-400 to-purple-400" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["Scout", "Captain", "Tactician"].map((badge) => (
                      <span
                        key={badge}
                        className="rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-200"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </section>
                <section className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5 shadow-[0_0_40px_rgba(15,23,42,0.95)]">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                    Momentum
                  </h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Streak
                      </p>
                      <p className="mt-2 text-lg font-semibold text-sky-200">
                        2 weeks active
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Keep voting to boost rewards.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        XP Earned
                      </p>
                      <p className="mt-2 text-lg font-semibold text-indigo-200">
                        +180 XP
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Weekly bonus for voting early.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </motion.section>
          )}
          {phase === "highlights" && (
            <motion.section
              key="highlights"
              className="mt-2 flex flex-col items-center gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Highlights
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-100">
                  Premier League Moments
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Catch up on the latest goals and matchday recaps.
                </p>
              </div>
              <HighlightsPanel
                clips={highlightClips}
                className="md:w-full md:max-w-3xl"
              />
            </motion.section>
          )}
          {phase === "rewards" && (
            <motion.section
              key="rewards"
              className="mt-2 flex flex-col items-center gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Rewards
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-100">
                  Play, Earn, Win
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Active fans earn entries into monthly prize draws.
                </p>
              </div>
              <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2">
                <section className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6 shadow-[0_0_45px_rgba(15,23,42,1)] backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                        Weekly Raffle
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-slate-100">
                        Win matchday tickets
                      </h3>
                    </div>
                    <span className="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                      Live
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-400">
                    Vote, share, and stay active to earn entries. Winners
                    announced monthly.
                  </p>
                  <div className="mt-4 grid gap-3 text-sm text-slate-300">
                    {[
                      "Vote on matchdays",
                      "Share highlights",
                      "Hit your weekly streak",
                      "Engage with match moments",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-slate-800/80 bg-slate-900/60 px-4 py-3"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </section>
                <section className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-6 shadow-[0_0_40px_rgba(15,23,42,0.95)]">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                      Rewards Won
                    </h3>
                    <span className="text-xs text-slate-500">
                      Last 4 months
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { month: "February", reward: "2x VIP tickets" },
                      { month: "January", reward: "Signed jersey raffle" },
                      {
                        month: "December",
                        reward: "Matchday hospitality pass",
                      },
                      { month: "November", reward: "Training ground tour" },
                    ].map((item) => (
                      <div
                        key={item.month}
                        className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 px-4 py-3 text-sm"
                      >
                        <span className="text-slate-200">{item.month}</span>
                        <span className="text-slate-400">{item.reward}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </motion.section>
          )}
          {phase === "spotlight" && (
            <motion.section
              key="spotlight"
              className="mt-2 flex flex-col items-center gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Matchday Spotlight
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-100">
                  Featured Performer
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  A closer look at the standout performance inspiring the
                  community this week.
                </p>
              </div>
              <div className="w-full max-w-3xl space-y-6">
                <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/70 shadow-[0_0_45px_rgba(15,23,42,0.95)]">
                  <Image
                    src="/assets/players/haaland.jpg"
                    alt="Matchday spotlight"
                    width={1200}
                    height={720}
                    className="h-64 w-full object-cover sm:h-72"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">
                      Spotlight
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-100">
                      Erling Haaland
                    </h3>
                    <p className="mt-1 text-sm text-slate-300">
                      3 goals • 9 shots on target • 78% pass accuracy
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      title: "Why he’s featured",
                      body: "A clinical hat-trick with relentless pressing set the tone for the weekend.",
                    },
                    {
                      title: "Moment of the match",
                      body: "A 68th-minute run in behind sealed the win and set the stadium alight.",
                    },
                  ].map((item) => (
                    <section
                      key={item.title}
                      className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 shadow-[0_0_30px_rgba(15,23,42,0.9)]"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                        {item.title}
                      </p>
                      <p className="mt-2 text-sm text-slate-300">{item.body}</p>
                    </section>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

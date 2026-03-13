import { create } from "zustand";
import { players as initialPlayers } from "@/data/players";
import type { Player } from "@/types/player";

type VoteState = {
  players: Player[];
  selectedPlayerId: string | null;
  hasVoted: boolean;
  totalVotes: number;
  voteInProgress: boolean;
  celebrationPlayerId: string | null;
  soundEnabled: boolean;
  weekDeadline: string;
};

type VoteActions = {
  vote: (playerId: string) => void;
  resetCelebration: () => void;
  toggleSound: () => void;
  hydrateFromStorage: (payload: {
    players?: Player[];
    totalVotes?: number;
    weekDeadline?: string;
  }) => void;
};

type VoteStore = VoteState & VoteActions;

const twoMinutesFromNow = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 2);
  return now.toISOString();
};

export const useVoteStore = create<VoteStore>((set, get) => ({
  players: initialPlayers,
  selectedPlayerId: null,
  hasVoted: false,
  totalVotes: 0,
  voteInProgress: false,
  celebrationPlayerId: null,
  soundEnabled: true,
  weekDeadline: twoMinutesFromNow(),

  vote: (playerId: string) => {
    const { hasVoted } = get();
    if (hasVoted) return;

    set((state) => {
      const updatedPlayers = state.players.map((player) =>
        player.id === playerId
          ? { ...player, votes: player.votes + 1 }
          : player,
      );

      return {
        players: updatedPlayers,
        selectedPlayerId: playerId,
        hasVoted: true,
        totalVotes: state.totalVotes + 1,
        celebrationPlayerId: playerId,
        voteInProgress: false,
      };
    });
  },

  resetCelebration: () =>
    set({
      celebrationPlayerId: null,
    }),

  toggleSound: () =>
    set((state) => ({
      soundEnabled: !state.soundEnabled,
    })),

  hydrateFromStorage: (payload) =>
    set((state) => ({
      ...state,
      players: payload.players ?? state.players,
      totalVotes:
        typeof payload.totalVotes === "number"
          ? payload.totalVotes
          : state.totalVotes,
      weekDeadline: payload.weekDeadline ?? state.weekDeadline,
    })),
}));


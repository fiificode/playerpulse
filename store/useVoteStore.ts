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
};

type VoteStore = VoteState & VoteActions;

const oneWeekFromNow = () => {
  const now = new Date();
  now.setDate(now.getDate() + 7);
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
  weekDeadline: oneWeekFromNow(),

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
}));

export const selectSortedPlayers = (state: VoteStore) =>
  [...state.players].sort((a, b) => b.votes - a.votes);

export const selectTotalVotes = (state: VoteStore) =>
  state.totalVotes || state.players.reduce((sum, p) => sum + p.votes, 0);


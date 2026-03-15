export type FanProfile = {
  id: string;
  name: string;
  xp: number;
  streak: string;
  badge: string;
};

export const fanLeaderboard: FanProfile[] = [
  { id: "fan-1", name: "Riley K.", xp: 1840, streak: "5 weeks", badge: "Captain" },
  { id: "fan-2", name: "Amir J.", xp: 1720, streak: "4 weeks", badge: "Tactician" },
  { id: "fan-3", name: "Sofia L.", xp: 1665, streak: "3 weeks", badge: "Scout" },
  { id: "fan-4", name: "Tomi A.", xp: 1580, streak: "3 weeks", badge: "Organizer" },
  { id: "fan-5", name: "Jordan P.", xp: 1515, streak: "2 weeks", badge: "Rivalry" },
  { id: "fan-6", name: "Noah V.", xp: 1480, streak: "2 weeks", badge: "Playmaker" },
];

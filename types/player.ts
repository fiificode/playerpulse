export type Player = {
  id: string;
  name: string;
  club: string;
  position: string;
  image: string;
  votes: number;
  stats: {
    goals: number;
    assists: number;
    keyPasses: number;
    shotsOnTarget: number;
    passAccuracy: number;
    tackles: number;
  };
};

export type Player = {
  username: string;
  score?: number;
  isTurn?: boolean;
};

export type PlayersListProps = {
  players: Player[];
};

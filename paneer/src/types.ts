type Player = {
  username: string;
  score?: number;
  isTurn?: boolean;
};

type PlayersListProps = {
  players: Player[];
};

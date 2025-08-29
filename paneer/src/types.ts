export type Player = {
  username: string;
  score?: number;
  isTurn?: boolean;
};

export type PlayersListProps = {
  players: Player[];
};

export type drawingData = {
  type: "draw";
  x: number;
  y: number;
  event: "start" | "move" | "end";
};

export type DrawingBoardProps = {
  token: string;
  socket: WebSocket | null;
  drawdata: drawingData | null;
  isArtist: boolean;
};

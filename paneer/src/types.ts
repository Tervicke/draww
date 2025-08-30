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

export type StartGameMessage = {
  type: string; // e.g., "game_start"
  endtime: number; // Unix timestamp in seconds
  artist: boolean; // true if the recipient is the artist, false otherwise
  name: string; // artist's name
  words?: string[]; // list of words for the artist to choose from
};

export type WordselectionProps = {
  words: string[] | null;
  isArtist: boolean;
  onSelect: (word: string) => void;
};

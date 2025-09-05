export type Player = {
  username: string;
  score?: number;
  isTurn?: boolean;
};

export type PlayersListProps = {
  players: Player[];
  correctGuesses: string[]; // list of users who have guessed correctly
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

export type Message = {
  id: string; // unique id
  sender: string;
  text: string;
  isSelf?: boolean; // highlight if it's the current user
};

export type GameProps = {
  token: string;
  roomID: string;
};

export type LobbyProps = {
  onJoin: (roomCode: string, userName: string) => void;
  onCreate: (userName: string) => void;
};

export type guessMessage = {
  type: "guess";
  word: string;
};

export type newRoundMessage = {
  type: "new_round";
  artist: boolean;
  name: string;
  words: string[];
  scores: Map<string, number>;
};

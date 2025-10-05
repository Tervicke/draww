import React from "react";

export type Player = {
  username: string;
  score?: number;
  isTurn?: boolean;
};

type GameOverProps = {
  playerList: Player[];
  onPlayAgain: () => void;
};

const GameOverScreen: React.FC<GameOverProps> = ({
  playerList,
  onPlayAgain,
}) => {
  const sortedPlayers = [...playerList].sort(
    (a, b) => (b.score || 0) - (a.score || 0)
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-6">
      <h1 className="text-4xl font-bold mb-6">🎉 Game Over 🎉</h1>
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-semibold text-center mb-4">Leaderboard</h2>
        <ul className="space-y-3">
          {sortedPlayers.map((player, index) => (
            <li
              key={player.username}
              className={`flex justify-between items-center p-3 rounded-xl shadow-sm ${
                index === 0
                  ? "bg-yellow-400 text-black font-bold"
                  : "bg-white/20"
              }`}
            >
              <span>
                {index + 1}. {player.username}
              </span>
              <span>{player.score ?? 0} pts</span>
            </li>
          ))}
        </ul>
      </div>
      <button
        className="mt-6 px-6 py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white shadow-lg"
        onClick={onPlayAgain}
      >
        🔄 Play Again
      </button>
    </div>
  );
};

export default GameOverScreen;

import React from "react";
import type { Score } from "../types";

export type Player = {
  username: string;
  score?: number;
  isTurn?: boolean;
};

type GameOverProps = {
  scoreList: Score[];
  onPlayAgain: () => void;
};

const GameOverScreen: React.FC<GameOverProps> = ({
  scoreList,
  onPlayAgain,
}) => {
  const sortedPlayers = [...scoreList].sort(
    (a, b) => (b.score || 0) - (a.score || 0)
  );

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 text-gray-900 p-6">
      <h1 className="text-3xl font-semibold mb-6">Game Over</h1>

      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-medium text-center mb-4">Leaderboard</h2>

        <ul className="divide-y divide-gray-200">
          {sortedPlayers.map((score, index) => (
            <li
              key={score.username}
              className={`flex justify-between items-center py-3 ${
                index === 0 ? "font-bold text-gray-800" : "text-gray-700"
              }`}
            >
              <span>
                {index + 1}. {score.username}
              </span>
              <span>{score.score ?? 0} pts</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        className="mt-6 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition"
        onClick={onPlayAgain}
      >
        🔄 Play Again
      </button>
    </div>
  );
};

export default GameOverScreen;

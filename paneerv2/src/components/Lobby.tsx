import { useState } from "react";
import React from "react";
import type { LobbyProps } from "../types";

export default function Lobby({ onJoin, onCreate }: LobbyProps) {
  const [roomCode, setRoomCode] = useState("");
  const [userName, setUserName] = useState("");

  // handle input change
  const handleInputChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setRoomCode(e.target.value);
  };

  // handle Join button click
  const handleJoinClick = () => {
    //check for empty roomcode
    if (roomCode.trim() === "") {
      alert("Please enter a room code");
      return;
    }

    //check for empty userName
    if (userName.trim() === "") {
      alert("Please enter a user name");
      return;
    }

    onJoin(roomCode.trim(), userName.trim());
  };

  // handle Create button click
  const handleCreateClick = () => {
    if (userName.trim() === "") {
      alert("Please enter a username");
      return;
    }
    onCreate(userName.trim());
  };

  const handleChangeUsername = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setUserName(e.target.value);
  };
  return (
    <div className="flex flex-col items-center mt-12 font-sans bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-8">Draww</h1>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Enter a username"
          value={userName}
          onChange={handleChangeUsername}
          className="px-4 py-2 w-52 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Enter Room Code"
          value={roomCode}
          onChange={handleInputChange}
          className="px-4 py-2 w-52 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleJoinClick}
          className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          Join Room
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleCreateClick}
          className="px-5 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition"
        >
          Create Room
        </button>
      </div>
    </div>
  );
}

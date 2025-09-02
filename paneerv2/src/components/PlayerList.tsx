import React, { useEffect } from "react";
import type { PlayersListProps } from "../types.ts";

const PlayersList: React.FC<PlayersListProps> = ({
  players,
  correctGuesses,
}) => {
  return (
    <div style={styles.wrapper}>
      <div style={styles.label}>🧑‍🤝‍🧑 Players</div>
      {players.map((player, index) => (
        <div
          key={index}
          style={{
            ...styles.playerCard,
            border: player.isTurn ? "2px solid #4caf50" : "1px solid #ccc",
            backgroundColor: player.isTurn
              ? "#e8f5e9"
              : correctGuesses.includes(player.username)
              ? "#d0f0c0"
              : "#fff",
          }}
        >
          <div style={styles.username}>{player.username}</div>
          <div style={styles.score}>Score: {player.score ?? 0}</div>
          {player.isTurn && <div style={styles.turnSign}>🎨</div>}
        </div>
      ))}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    width: "200px", // adjust as needed
  },
  playerCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: "6px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  username: {
    fontWeight: "bold",
  },
  score: {
    marginLeft: "auto",
    marginRight: "8px",
  },
  turnSign: {
    fontSize: "18px",
  },
  label: {
    fontWeight: "bold",
    fontSize: "16px",
    marginBottom: "4px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#333",
  },
};

export default PlayersList;

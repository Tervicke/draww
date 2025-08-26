import { useState } from "react";

export default function Lobby({ onJoin, onCreate }) {
  const [roomCode, setRoomCode] = useState("");

  // handle input change
  const handleInputChange = (e) => {
    setRoomCode(e.target.value);
  };

  // handle Join button click
  const handleJoinClick = () => {
    if (roomCode.trim() !== "") {
      onJoin(roomCode.trim());
    } else {
      alert("Please enter a room code!");
    }
  };

  // handle Create button click
  const handleCreateClick = () => {
    onCreate();
  };

  return (
    <div style={styles.container}>
      <h1>Draww</h1>

      <div style={styles.section}>
        <input
          type="text"
          placeholder="Enter Room Code"
          value={roomCode}
          onChange={handleInputChange}
          style={styles.input}
        />
        <button onClick={handleJoinClick} style={styles.button}>
          Join Room
        </button>
      </div>

      <div style={styles.section}>
        <button onClick={handleCreateClick} style={styles.button}>
          Create Room
        </button>
      </div>
    </div>
  );
}

// Simple inline styles for quick UI
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "50px",
    fontFamily: "Arial, sans-serif",
  },
  section: {
    margin: "20px 0",
    display: "flex",
    gap: "10px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    width: "200px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
  },
};
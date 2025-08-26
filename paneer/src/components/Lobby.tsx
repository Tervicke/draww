import { useState } from "react";
import React from 'react';

export default function Lobby({ onJoin, onCreate }) {
  const [roomCode, setRoomCode] = useState("");
  const [userName , setUserName] = useState("");

  // handle input change
  const handleInputChange = (e) => {
    setRoomCode(e.target.value);
  };

  // handle Join button click
  const handleJoinClick = () => {
    //check for empty roomcode
    if(roomCode.trim() === ""){
      alert("Please enter a room code");
      return;
    }

    //check for empty userName
    if(userName.trim() === ""){
      alert("Please enter a user name");
      return;
    }

    onJoin(roomCode.trim() , userName.trim());
  };

  // handle Create button click
  const handleCreateClick = () => {
    if(userName.trim() === ""){
      alert("Please enter a username");
      return;
    }
    onCreate(userName.trim());
  };

  const handleChangeUsername = (e)  => {
    setUserName(e.target.value)
  }

  return (
    <div style={styles.container}>
      <h1>Draww</h1>
      <div style={styles.section}>
      <input
      type="text"
      placeholder="Enter a username"
      value={userName}
      onChange={handleChangeUsername}
      style={styles.input}
      />
      </div>
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
  } as React.CSSProperties,
  section: {
    margin: "20px 0",
    display: "flex",
    gap: "10px",
  } as React.CSSProperties,
  input: {
    padding: "10px",
    fontSize: "16px",
    width: "200px",
  } as React.CSSProperties,
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
  } as React.CSSProperties,
};
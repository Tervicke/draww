import React, { createContext, useEffect } from "react";
import "./App.css";
import { useState, useRef } from "react";
import Game from "./components/Game.tsx";
import Lobby from "./components/Lobby.tsx";
import { WebSocketProvider } from "./components/WebSocketContext.tsx";

//game states => Lobby , GameRunning , GameOver
function App() {
  type GameState = "Lobby" | "GameRunning" | "GameOver";

  const [token, setToken] = useState<String>("");
  const [gameState, changeState] = useState<GameState>("Lobby");

  function createRoom(userName: string): void {
    //send the create room post request which will send back the room ID and the token
    fetch("http://localhost:8080/createRoom", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userName: userName,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setToken(data.token);
        changeState("GameRunning");
      })
      .catch((err) => console.error(err));
  }

  function joinRoom(id: string, userName: string): void {
    changeState("GameRunning");
  }

  if (gameState == "GameRunning") {
    return (
      <WebSocketProvider>
        <Game token={token}></Game>
      </WebSocketProvider>
    );
  }

  if (gameState == "Lobby") {
    return <Lobby onCreate={createRoom} onJoin={joinRoom}></Lobby>;
  }
}

export default App;

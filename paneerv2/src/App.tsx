import "./App.css";
import { useState } from "react";
import Game from "./components/Game.tsx";
import Lobby from "./components/Lobby.tsx";
import { WebSocketProvider } from "./components/WebSocketContext.tsx";
import GameOverScreen from "./components/GameOver.tsx";
import type { Score } from "./types.ts";

//game states => Lobby , GameRunning , GameOver
function App() {
  type GameState = "Lobby" | "GameRunning" | "GameOver";

  const [token, setToken] = useState<string>("");
  const [gameState, changeState] = useState<GameState>("Lobby");
  const [roomID, setRoomID] = useState<string>("");
  const [scores, setScores] = useState<Score[]>([]);

  function onGameOver(scores: Score[]): void {
    changeState("GameOver");
    setScores(scores);
  }

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
        setRoomID(data.roomID);
        changeState("GameRunning");
      })
      .catch((err) => console.error(err));
  }

  function joinRoom(id: string, userName: string): void {
    console.log("joining room" + id);
    fetch("http://localhost:8080/joinRoom", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userName: userName,
        roomID: id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setToken(data.token);
        setRoomID(id);
        changeState("GameRunning");
        console.log(data);
      })
      .catch((err) => console.error(err));
  }

  if (gameState == "GameRunning") {
    return (
      <WebSocketProvider>
        <Game token={token} roomID={roomID} onGameOver={onGameOver}></Game>
      </WebSocketProvider>
    );
  }

  if (gameState == "Lobby") {
    return <Lobby onCreate={createRoom} onJoin={joinRoom}></Lobby>;
  }

  if (gameState == "GameOver") {
    return (
      <GameOverScreen scoreList={scores} onPlayAgain={function (): void {}} />
    );
  }
}

export default App;

import React from 'react'
import './App.css';
import { useState } from 'react'
import Game from './components/Game.tsx'
import Lobby from './components/Lobby.tsx';

//game states => Lobby , GameRunning , GameOver 
function App() {
  type GameState = 'Lobby' | 'GameRunning' | 'GameOver';

  const [gameState , changeState] = useState<GameState>('GameRunning');

  function createRoom(userName: string): void{
    changeState("GameRunning")
  }

  function joinRoom(id: string , userName: string): void{
    changeState("GameRunning")
  }


  if(gameState == 'GameRunning'){
    return (
      <Game></Game>
    );
  }

  if(gameState == "Lobby"){
    return  ( 
      <Lobby onCreate={createRoom} onJoin={joinRoom}></Lobby>
    );
  }

}

export default App;

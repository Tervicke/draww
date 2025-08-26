import React from 'react'
import './App.css';
import { useState } from 'react'
import DrawingBoard from './components/DrawingBoard.tsx'
import Lobby from './components/Lobby.tsx';

//game states => Lobby , GameRunning , GameOver 
function App() {
  type GameState = 'Lobby' | 'GameRunning' | 'GameOver';

  const [gameState , changeState] = useState<GameState>('Lobby');

  function createRoom(): void{
    changeState("GameRunning")
  }

  function joinRoom(id: string): void{
    changeState("GameRunning")
  }


  if(gameState == 'GameRunning'){
    return (
     <DrawingBoard></DrawingBoard>
    );
  }else if(gameState == "Lobby"){
    return  <Lobby onCreate={createRoom} onJoin={joinRoom}></Lobby>
  }

}

export default App;

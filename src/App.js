import './App.css';
import { useState } from 'react'
import DrawingBoard from './components/DrawingBoard'
import Lobby from './components/Lobby';

//game states => Lobby , GameRunning , GameOver 
function App() {

  const [gameState , changeState] = useState('Lobby');

  function createRoom(){
    changeState("GameRunning")
  }

  function joinRoom(id){
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

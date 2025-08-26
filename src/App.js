import './App.css';
import { useState } from 'react'
import DrawingBoard from './components/DrawingBoard'
import Lobby from './components/Lobby';

//game states => Lobby , GameRunning , GameOver 
function App() {

  function createRoom(){
    alert("creating a room");
  }

  function joinRoom(id){
    alert("joining a room with id " + id);
  }

  const [gameState , changeState] = useState('Lobby');

  if(gameState == 'GameRunning'){
    return (
     <DrawingBoard></DrawingBoard>
    );
  }else if(gameState == "Lobby"){
    return  <Lobby onCreate={createRoom} onJoin={joinRoom}></Lobby>
  }

}

export default App;

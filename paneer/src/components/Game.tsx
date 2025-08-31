import React, { useEffect, useState } from "react";
import DrawingBoard from "./DrawingBoard.tsx";
import { useWebSocket } from "./WebSocketContext.tsx";
import PlayersList from "./PlayerList.tsx";
import { drawingData, Player, StartGameMessage } from "../types.ts";
import WordSelection from "./WordSelection.tsx";
function Game({ token, roomID }) {
  const socket = useWebSocket();
  const [players, updatePlayers] = useState<Player[]>([]);
  const [drawdata, updateDrawData] = useState<drawingData | null>(null);
  const [isArtist, setIsArtist] = useState<boolean>(false);
  const [words, setWords] = useState<string[]>([]); //setwords if the current player is artist and his word of choices
  const [selectword, setSelectedWord] = useState<string>("");

  function sendSelectedWord(word: string) {
    setWords([]); //clear the words after selecting so that it stops rendering
    setSelectedWord(word);
    sendSafe(JSON.stringify({ type: "new_word", word: word }));
  }

  //safe sending in the socket
  const sendSafe = (msg: string) => {
    if (!socket) {
      console.log("didnt send because null");
      return;
    }
    //apply the sample socket close

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(msg);
    } else {
      console.log("WebSocket not ready, state:", socket.readyState);
    }
  };

  useEffect(() => {
    if (words && isArtist) {
    }
  }, [words, isArtist]);

  //send the initial token for verification on the server end
  useEffect(() => {
    if (!socket) {
      console.log("Socket not available yet");
      return;
    }
    if (token === "") {
      console.log("token not availiable yet");
      return;
    }

    socket.onmessage = (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      console.log(data);
      //update players
      if (data.type == "players_update") {
        const players = data.players as Player[];
        updatePlayers(players);
      }

      //drawing data
      if (data.type == "draw") {
        const newdrawdata = data as drawingData;
        updateDrawData(newdrawdata);
      }

      //game start data
      if (data.type == "game_start") {
        const gameData = data as StartGameMessage;
        console.log(gameData);
        setIsArtist(gameData.artist);
        setWords(gameData.words ? [...gameData.words] : []);

        //show an alert if the user is not the artist that the artist is choosing a word
        if (!gameData.artist) {
          alert(gameData.name + " is choosing a word");
        }

        //start the timer for 3 minutes by using the endtime from the server by adding a component on the top right corner
        const endtime = data.endtime as number;
        const currentTime = Math.floor(Date.now() / 1000);
        const duration = endtime - currentTime;
        console.log("Game duration (seconds):", duration);
      }

      if (data.type == "masked_word") {
        const word = data.word as string;
        setSelectedWord(word);
      }
    };

    if (socket.readyState === WebSocket.CONNECTING) {
      // Only add onopen if socket isn't already open
      socket.onopen = () => {
        socket.send(JSON.stringify({ type: "token", token: token }));
        console.log("token message sent");
      };
    } else if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "token", token: token }));
      console.log("token message sent");
    }
  }, [socket, token]);

  return (
    <div>
      <h1>Draww</h1>
      <div>Room Code: {roomID}</div>
      <div> {selectword}</div>
      <WordSelection
        words={words}
        isArtist={isArtist}
        onSelect={sendSelectedWord}
      ></WordSelection>
      <div style={styles.wrapper}>
        <div style={{ ...styles.container, ...styles.left }}>
          <PlayersList players={players}></PlayersList>
        </div>
        <div style={{ ...styles.container, ...styles.center }}>
          <DrawingBoard
            token={token}
            socket={socket}
            drawdata={drawdata}
            isArtist={isArtist}
          ></DrawingBoard>
        </div>
        <div style={{ ...styles.container, ...styles.right }}>Right</div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    display: "flex",
    width: "100%",
    height: "200px",
  },
  container: {
    flex: 1, // each container takes equal space
    padding: "10px",
    boxSizing: "border-box",
  },
};
export default Game;

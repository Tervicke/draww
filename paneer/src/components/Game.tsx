import React, { useEffect, useState } from "react";
import DrawingBoard from "./DrawingBoard.tsx";
import { useWebSocket } from "./WebSocketContext.tsx";
import PlayersList from "./PlayerList.tsx";
import { drawingData, Player } from "../types.ts";

function Game({ token, roomID }) {
  const socket = useWebSocket();
  const [players, updatePlayers] = useState<Player[]>([]);
  const [drawdata, updateDrawData] = useState<drawingData | null>(null);
  const [isArtist, setIsArtist] = useState<boolean>(false);

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
      if (data.type == "players_update") {
        const players = data.players as Player[];
        updatePlayers(players);
      }
      if (data.type == "draw") {
        const newdrawdata = data as drawingData;
        updateDrawData(newdrawdata);
      }
      if (data.type == "game_start") {
        console.log("game started");
        if (data.artist) {
          //prompt the user to enter a word to draw and send it to the server and also dont use default prompt because it may get blocked by chrome modern day browsers
          const word = prompt("You are the artist! Enter a word to draw:");
          if (word) {
            sendSafe(JSON.stringify({ type: "new_word", word: word }));
          } else {
            alert("You must enter a word! You will be assigned a random word.");
            sendSafe(JSON.stringify({ type: "random_word", word: "-" }));
          }
          setIsArtist(data.isArtist);
        } else {
          console.log(data.Name + "is choosing a word");
          alert(data.Name + "is choosing a word");
          setIsArtist(data.isArtist);
        }
        //start the timer for 3 minutes by using the endtime from the server by adding a component on the top right corner
        const endtime = data.endtime as number;
        const currentTime = Math.floor(Date.now() / 1000);
        const duration = endtime - currentTime;
        console.log("Game duration (seconds):", duration);
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

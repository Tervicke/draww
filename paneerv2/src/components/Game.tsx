import React, { useEffect, useState } from "react";
import DrawingBoard from "./DrawingBoard.tsx";
import { useWebSocket } from "./WebSocketContext.tsx";
import PlayersList from "./PlayerList.tsx";
import type {
  drawingData,
  GameProps,
  Message,
  Player,
  StartGameMessage,
} from "../types.ts";
import WordSelection from "./WordSelection.tsx";
import ChatSection from "./ChatSection.tsx";

function Game({ token, roomID }: GameProps) {
  const socket = useWebSocket();
  const [players, updatePlayers] = useState<Player[]>([]);
  const [drawdata, updateDrawData] = useState<drawingData | null>(null);
  const [isArtist, setIsArtist] = useState<boolean>(false);
  const [words, setWords] = useState<string[]>([]); //setwords if the current player is artist and his word of choices
  const [selectword, setSelectedWord] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  function handleSend(text: string) {
    // Implement the logic to send a message
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: Date.now().toString(), sender: "You", text: text, isSelf: true },
    ]);
    const data = { type: "guess", word: text };
    sendSafe(JSON.stringify(data));
  }
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

      if (data.type == "correct_guess") {
        const guesser = data.username as string;
        const word = data.word as string;
        //notify that the guesser has guessed the word
        console.log("correct guess by " + guesser + " the word was " + word);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now().toString(),
            sender: guesser,
            text: word,
            isSelf: false,
          },
        ]);
        if (data.right) {
          setSelectedWord(word);
        }
      }
      if (data.type == "wrong_guess") {
        const guesser = data.username as string;
        const word = data.word as string;
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now().toString(),
            sender: guesser,
            text: word,
            isSelf: false,
          },
        ]);
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
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>Draww 🎨</h1>
        <div>Room Code: {roomID}</div>
        <div>{selectword}</div>
      </header>

      {/* Word selection */}
      <div style={{ marginBottom: "20px" }}>
        <WordSelection
          words={words}
          isArtist={isArtist}
          onSelect={sendSelectedWord}
        />
      </div>

      {/* Main game area */}
      <div style={styles.wrapper}>
        {/* Left: Players */}
        <div style={{ ...styles.container, ...styles.left }}>
          <PlayersList players={players} />
        </div>

        {/* Center: Drawing board */}
        <div style={{ ...styles.container, ...styles.center }}>
          <DrawingBoard
            token={token}
            socket={socket}
            drawdata={drawdata}
            isArtist={isArtist}
          />
        </div>

        {/* Right: Chat */}
        <div style={{ ...styles.container, ...styles.right }}>
          <ChatSection messages={messages} onSend={handleSend} />
        </div>
      </div>
    </div>
  );
}
const styles: { [key: string]: React.CSSProperties } = {
  page: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100vh",
    background: "#f8fafc", // light gray bg
    padding: "10px",
    boxSizing: "border-box",
  },
  header: {
    textAlign: "center",
    marginBottom: "10px",
  },
  title: {
    margin: 0,
    fontSize: "2rem",
    color: "#1e293b",
  },
  wrapper: {
    display: "flex",
    flex: 1,
    width: "100%",
    maxWidth: "1200px",
    gap: "10px",
  },
  container: {
    flex: 1,
    padding: "10px",
    boxSizing: "border-box",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
  },
  left: {
    maxWidth: "200px",
  },
  center: {
    flex: 2, // bigger center for drawing board
  },
  right: {
    maxWidth: "300px",
  },
};
export default Game;

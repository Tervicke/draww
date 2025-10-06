import { useEffect, useState } from "react";
import DrawingBoard from "./DrawingBoard.tsx";
import { useWebSocket } from "./WebSocketContext.tsx";
import PlayersList from "./PlayerList.tsx";
import type {
  drawingData,
  GameProps,
  Message,
  newRoundMessage,
  Player,
  Score,
  StartGameMessage,
} from "../types.ts";
import WordSelection from "./WordSelection.tsx";
import ChatSection from "./ChatSection.tsx";

function Game({ token, roomID, onGameOver }: GameProps) {
  const socket = useWebSocket();
  const [players, updatePlayers] = useState<Player[]>([]);
  const [drawdata, updateDrawData] = useState<drawingData | null>(null);
  const [isArtist, setIsArtist] = useState<boolean>(false);
  const [words, setWords] = useState<string[]>([]); //setwords if the current player is artist and his word of choices
  const [selectword, setSelectedWord] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [correctGuesses, setCorrectGuesses] = useState<string[]>([]); //list of users who have guessed correctly
  const [clearSignal, setClearSignal] = useState(0);

  //player score update
  function updatescore(score: number, username: string) {
    setCorrectGuesses((prev) => {
      if (prev.includes(username)) {
        return prev; // If the username is already in the list, return the previous state
      }
      return [...prev, username]; // Otherwise, add the username to the list
    });

    if (correctGuesses.includes(username)) {
      return; //if the user has already guessed correctly, do not update the score again
    }

    updatePlayers(
      (prevPlayers) =>
        prevPlayers
          .map((player) =>
            player.username === username
              ? { ...player, score } // create new object
              : player
          )
          .sort((a, b) => (b.score ?? 0) - (a.score ?? 0)) // sort descending by score
    );
  }

  //handle sending a message
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

  useEffect(() => {
    console.log("players updated", players);
  }, [players]);

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
        const updatedplayers = data.players as Player[];
        updatePlayers(updatedplayers);
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

        //update the message
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now().toString(),
            sender: guesser,
            text: "correctly guessed the word",
            isSelf: false,
          },
        ]);

        if (data.right) {
          setSelectedWord(word);
        }
        //update the score
        updatescore(data.score, guesser);
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

      if (data.type == "game_end") {
        alert("Game Over! The word was: " + data.word);
        setSelectedWord(data.word);
        setClearSignal((prev) => prev + 1); //send a signal to clear the board
      }

      if (data.type == "new_round") {
        const roundData = data as newRoundMessage;
        if (!roundData.artist) {
          alert(roundData.name + " is choosing a word");
        }
        setIsArtist(roundData.artist);
        setWords(roundData.words ? [...roundData.words] : []);
        setCorrectGuesses([]);
        console.log(roundData.scores);
        //updateScore(roundData.scores);
      }

      if (data.type == "game_over") {
        const scoreObj = data.scores as Record<string, number>;
        //convert scoreobject into the scores arrays
        const scores: Score[] = Object.entries(scoreObj).map(
          ([username, score]) => ({
            username,
            score,
          })
        );
        console.log(scores);
        onGameOver(scores);
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
    <div className="flex flex-col h-screen w-[95%] bg-gray-100 overflow-hidden mx-auto border border-gray-300 rounded-xl shadow-lg">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-2 bg-blue-600 text-white shadow-md flex-shrink-0 border-b border-blue-700 rounded-t-xl h-15">
        <h1 className="text-xl font-bold">Draww 🎨</h1>
        <div className="flex gap-6 text-base">
          <span>Room: {roomID}</span>
          <span className="bg-blue-500 px-3 py-1 rounded-lg">
            {selectword || "Waiting..."}
          </span>
        </div>
      </header>

      {/* Word Selection (only if artist) */}
      {isArtist && (
        <div className="bg-white py-2 flex justify-center shadow-sm flex-shrink-0 border-2 border-gray-300 rounded-lg my-2 mx-4">
          <WordSelection
            words={words}
            isArtist={isArtist}
            onSelect={sendSelectedWord}
          />
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 h-[90vh] overflow-hidden px-4 py-2 gap-4">
        {/* Players */}
        <aside className="w-[15%] bg-white border-2 border-gray-300 rounded-lg p-3 overflow-y-auto shadow-sm">
          <PlayersList players={players} correctGuesses={correctGuesses} />
        </aside>

        {/* Drawing board */}
        <section className="w-[65%] bg-gray-200 flex items-center justify-center p-2 border-2 border-gray-300 rounded-lg shadow-sm">
          <div className="bg-white rounded-xl shadow-md w-full h-full flex items-center justify-center border border-gray-200">
            <DrawingBoard
              token={token}
              socket={socket}
              drawdata={drawdata}
              isArtist={isArtist}
              clearSignal={clearSignal}
            />
          </div>
        </section>

        {/* Chat */}
        <aside className="w-[20%] h-full bg-white border-2 border-gray-300 rounded-lg p-3 shadow-sm flex flex-col">
          <ChatSection messages={messages} onSend={handleSend} />
        </aside>
      </div>
      <footer className="flex justify-center items-center bg-gray-200 text-gray-700 py-2 mt-2 rounded-lg border-t border-gray-300">
        <p className="text-sm">
          Made with <span className="text-red-500">❤️</span> by{" "}
          <span className="font-semibold">tervicke</span> •
          <a
            href="https://github.com/tervicke/your-repo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline ml-1"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export default Game;

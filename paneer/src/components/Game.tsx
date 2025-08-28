import React, { useEffect } from "react";
import DrawingBoard from "./DrawingBoard.tsx";
import { useWebSocket } from "./WebSocketContext.tsx";

function Game({ token }) {
  const socket = useWebSocket();

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

    socket.onmessage = (e) => {
      console.log("got message: ", e.data);
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
      <div style={styles.wrapper}>
        <div style={{ ...styles.container, ...styles.left }}>Left</div>
        <div style={{ ...styles.container, ...styles.center }}>
          <DrawingBoard token={token} socket={socket}></DrawingBoard>
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

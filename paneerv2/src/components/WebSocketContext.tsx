import { createContext, useContext, useEffect, useState } from "react";
import React from "react";
export const WebSocketContext = createContext<WebSocket | null>(null);

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [socket, setSocket] = React.useState<WebSocket | null>(null);
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/ws");

    ws.onopen = () => {
      console.log("socket set from the websocketcontext");
      setSocket(ws);
    };

    ws.onerror = () => {
      console.error("error in the webcontext websocket");
      setSocket(null);
    };

    ws.onclose = () => {
      console.log("websocket closed");
      setSocket(null);
    };

    return () => {
      console.log("cleaning up the websocket");
      ws.close();
    };
  }, []);
  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);

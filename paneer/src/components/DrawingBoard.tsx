import React, { useRef, useEffect, RefObject } from "react";
import { useWebSocket } from "./WebSocketContext.tsx";

function DrawingBoard({ token }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawing = useRef(false);
  const socket = useWebSocket();
  //safe sending in the socket
  const sendSafe = (msg: string) => {
    if (!socket) {
      console.log("didnt send because null");
      return;
    }
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(msg);
    } else {
      console.log("WebSocket not ready, state:", socket.readyState);
    }
  };
  // Initialize canvas and context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 800;
    canvas.height = 600;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    ctxRef.current = ctx;
  }, []);

  //event handlers
  const getMousePos = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: MouseEvent) => {
    if (!ctxRef.current) return;
    isDrawing.current = true;
    const pos = getMousePos(e);
    sendSafe(JSON.stringify({ x: pos.x, y: pos.y }));
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(pos.x, pos.y);
  };

  const draw = (e: MouseEvent) => {
    if (!isDrawing.current || !ctxRef.current) return;
    const pos = getMousePos(e);
    sendSafe(JSON.stringify({ x: pos.x, y: pos.y }));
    ctxRef.current.lineTo(pos.x, pos.y);
    ctxRef.current.stroke();
  };

  const stopDrawing = (e) => {
    if (!ctxRef.current) return;
    const pos = getMousePos(e);
    sendSafe(JSON.stringify({ x: pos.x, y: pos.y }));
    isDrawing.current = false;
    ctxRef.current.closePath();
  };

  useEffect(() => {
    if (!socket) {
      console.log("Socket not available yet");
      return;
    }
    if (token === "") {
      console.log("token not availiable yet");
      return;
    }

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseleave", stopDrawing);
    };
  }, [draw, startDrawing, stopDrawing]);

  return (
    <canvas
      ref={canvasRef}
      style={{ border: "1px solid black", cursor: "crosshair" }}
    />
  );
}

export default DrawingBoard;

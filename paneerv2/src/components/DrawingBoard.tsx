import { useRef, useEffect } from "react";
import type { DrawingBoardProps, drawingData } from "../types.ts";

function sendSafe(socket: WebSocket | null, msg: drawingData) {
  if (socket && socket.readyState == WebSocket.OPEN) {
    socket.send(JSON.stringify(msg));
    console.log("sent some drawing data");
  }
}

function drawStroke(ctx: CanvasRenderingContext2D, stroke: drawingData) {
  console.log("drawing the stroke");
  if (stroke.event === "start") {
    ctx.beginPath();
    ctx.moveTo(stroke.x, stroke.y);
  } else if (stroke.event === "move") {
    ctx.lineTo(stroke.x, stroke.y);
    ctx.stroke();
  } else if (stroke.event === "end") {
    ctx.closePath();
  }
}

function DrawingBoard({ socket, drawdata, isArtist }: DrawingBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawing = useRef(false);

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

  //update the data
  useEffect(() => {
    console.log("use effect working");
    if (!drawdata) {
      return;
    }
    if (ctxRef.current) {
      drawStroke(ctxRef.current, drawdata);
    }
  }, [drawdata]);

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
    sendSafe(socket, {
      type: "draw",
      x: pos.x,
      y: pos.y,
      event: "start",
    });
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(pos.x, pos.y);
  };

  const draw = (e: MouseEvent) => {
    if (!isDrawing.current || !ctxRef.current) return;
    const pos = getMousePos(e);

    sendSafe(socket, {
      type: "draw",
      x: pos.x,
      y: pos.y,
      event: "move",
    });

    ctxRef.current.lineTo(pos.x, pos.y);
    ctxRef.current.stroke();
  };

  const stopDrawing = (e: MouseEvent) => {
    if (!ctxRef.current) return;
    const pos = getMousePos(e);
    sendSafe(socket, {
      type: "draw",
      x: pos.x,
      y: pos.y,
      event: "end",
    });
    isDrawing.current = false;
    ctxRef.current.closePath();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    console.log("isArtist-" + isArtist);
    if (isArtist) {
      //only add event listeners if the user is the artist
      canvas.addEventListener("mousedown", startDrawing);
      canvas.addEventListener("mousemove", draw);
      canvas.addEventListener("mouseup", stopDrawing);
      canvas.addEventListener("mouseleave", stopDrawing);
    }

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseleave", stopDrawing);
    };
  }, [draw, startDrawing, stopDrawing, isArtist]);

  return (
    <canvas
      ref={canvasRef}
      style={{ border: "1px solid black", cursor: "crosshair" }}
    />
  );
}

export default DrawingBoard;

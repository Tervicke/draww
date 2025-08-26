import { useRef, useEffect } from 'react';

function DrawingBoard() {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // set canvas dimensions
    canvas.width = 800;
    canvas.height = 600;

    // drawing properties
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    // get mouse position
    const getMousePos = (e) => {
      if(!e || !canvas) return {x:0 , y:0};
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const startDrawing = (e) => {
      isDrawing.current = true;
      const pos = getMousePos(e);
      console.log("drawing started",pos)
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e) => {
      if (!isDrawing.current) return;
      const pos = getMousePos(e);
      ctx.lineTo(pos.x, pos.y);
      console.log("drawing continues",pos)
      ctx.stroke();
    };

    const stopDrawing = (e) => {
      isDrawing.current = false;
      const pos = getMousePos(e);
      console.log("drawing ended",pos)
      ctx.closePath();
    };

    // attach listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ border: '1px solid black', cursor: 'crosshair' }}
    />
  );
}

export default DrawingBoard;
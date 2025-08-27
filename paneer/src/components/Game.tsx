import React from "react";
import DrawingBoard from "./DrawingBoard.tsx";
import { RefObject } from "react";

function Game() {
  return (
    <div>
      <h1>Draww</h1>
      <div style={styles.wrapper}>
        <div style={{ ...styles.container, ...styles.left }}>Left</div>
        <div style={{ ...styles.container, ...styles.center }}>
          <DrawingBoard></DrawingBoard>
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

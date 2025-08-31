import { useEffect } from "react";
import type { WordselectionProps } from "../types";

export default function WordSelection({
  words,
  isArtist,
  onSelect,
}: WordselectionProps) {
  console.log("Rendering parent with:", { isArtist, words });
  useEffect(() => {
    if (words && isArtist) {
      console.log("Artist needs to pick a word!");
    }
  }, [words, isArtist]);

  if (!isArtist || !words || words.length === 0) return null;

  console.log("Rendering WordSelection with words:", words);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "15px" }}>Choose a word to draw 🎨</h2>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          {words.map((word, idx) => (
            <button
              key={idx}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                background: "#f0f0f0",
                cursor: "pointer",
              }}
              onClick={() => onSelect(word)}
            >
              {word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

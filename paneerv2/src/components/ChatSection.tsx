import React, { useEffect, useRef, useState } from "react";

type Message = {
  id: string; // unique id
  sender: string;
  text: string;
  isSelf?: boolean; // highlight if it's the current user
};

type ChatProps = {
  messages: Message[];
  onSend: (text: string) => void; // callback to push new message
};

const ChatSection: React.FC<ChatProps> = ({ messages, onSend }) => {
  const [inputValue, setInputValue] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // auto-scroll to bottom when new message comes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() === "") return;
    onSend(inputValue.trim());
    setInputValue(""); // clear input
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="w-full flex flex-col h-screen bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 bg-blue-500 text-white rounded-t-xl font-semibold text-center flex-shrink-0">
        💬 Chat
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 bg-gray-50 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 px-3 py-2 rounded-lg text-sm max-w-[80%] break-words ${
              msg.isSelf
                ? "bg-blue-500 text-white ml-auto"
                : "bg-gray-200 text-gray-900"
            }`}
          >
            <span className="font-semibold">{msg.sender}: </span>
            <span>{msg.text}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-2 border-t border-gray-200 flex gap-2 flex-shrink-0 bg-white">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your guess..."
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-600 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatSection;

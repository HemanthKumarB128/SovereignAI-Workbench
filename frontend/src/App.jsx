import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);

    const userMessage = {
      role: "user",
      text: message,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await axios.post("http://localhost:8000/chat", {
        message: message,
      });

      const aiMessage = {
        role: "ai",
        text: res.data.response,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Backend connection failed.",
        },
      ]);
    }

    setLoading(false);
    setMessage("");
  };

  return (
    <div className="wrap">
      <div className="topbar">
        <button className="icon-btn">☰</button>
        <div className="avatar">HB</div>
      </div>

      <header>
        <div className="mark">SOVEREIGN AI</div>

        <h1>
          Sovereign <span>AI Workbench</span>
        </h1>

        <p className="sub">
          On-premise assistant for refinery operations — ask a question,
          or attach a document / image for analysis.
        </p>
      </header>

      <div className="chat-area">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`msg ${msg.role === "user" ? "user" : "bot"}`}
          >
            <div className="who">
              {msg.role === "user" ? "HB" : "AI"}
            </div>

            <div className="bubble">
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="composer">
        <div className="bar">
          <button className="icon-btn">+</button>

          <textarea
            rows="1"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
            }
          }}
          placeholder="Message the Workbench..."
          />

          <button
            className="send"
            onClick={sendMessage}
            disabled={loading}
          >
            {loading ? "..." : "↑"}
          </button>
        </div>

        <div className="hint">
          Press <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line
        </div>
      </div>
    </div>
  );
}

export default App;
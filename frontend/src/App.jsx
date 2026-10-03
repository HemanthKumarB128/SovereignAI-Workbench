import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(
        "http://localhost:8000/upload",
        formData
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          text: `📄 ${file.name}`,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "❌ Upload failed",
        },
      ]);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() && !selectedFile) return;

    if (selectedFile) {
      await uploadFile(selectedFile);
      setSelectedFile(null);
    }

    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      text: message,
    };

    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:8000/chat",
        {
          message: message,
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: res.data.response,
        },
      ]);
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
          On-premise assistant for refinery operations —
          ask a question, or attach a document / image
          for analysis.
        </p>
      </header>

      <div className="chat-area">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`msg ${
              msg.role === "user" ? "user" : "bot"
            }`}
          >
            <div className="who">
              {msg.role === "user" ? "HB" : "AI"}
            </div>

            <div className="bubble">
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="msg bot">
            <div className="who">AI</div>

            <div className="bubble loading-bubble">
              <div className="typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef}></div>
      </div>

      {selectedFile && (
        <div className="selected-file">
          📄 {selectedFile.name}
        </div>
      )}

      <div className="composer">
        <div className="bar">
          <button
            className="icon-btn"
            onClick={() =>
              fileInputRef.current.click()
            }
          >
            +
          </button>

          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files[0]) {
                setSelectedFile(
                  e.target.files[0]
                );
              }
            }}
          />

          <textarea
            rows="1"
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey
              ) {
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
            {loading ? (
              <div className="loader"></div>
            ) : (
              "↑"
            )}
          </button>
        </div>

        <div className="hint">
          Press <kbd>Enter</kbd> to send ·{" "}
          <kbd>Shift+Enter</kbd> for new line
        </div>
      </div>
    </div>
  );
}

export default App;
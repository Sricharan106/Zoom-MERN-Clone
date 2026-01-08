import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import styles from "../styles/videoComponent.module.css";

export default function ChatPannel({
  socketRef,
  socketIdRef,
  onClose,
  username,
}) {
  let [messages, setMessages] = useState([]); // all messages
  let [message, setMessage] = useState(""); // your message

  useEffect(() => {
    if (!socketRef.current) return;

    const handler = (data, sender, socketIdSender) => {
      setMessages((prev) => [...prev, { sender, data }]);
    };

    socketRef.current.on("chat-message", handler);

    return () => {
      socketRef.current.off("chat-message", handler);
    };
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  };
  return (
    <div>
      <h2>Chats</h2>

      <div
        className={styles.allMessages}
        style={{
          maxHeight: "90vh",
          overflowY: "auto",
          maxWidth: "30vw",
        }}
      >
        {messages.map((m, i) => (
          <div key={i} className={styles.message}>
            <b>{m.sender}:</b>
            <span className={styles.messageText}>{m.data}</span>
          </div>
        ))}
      </div>
      <div className={styles.chatArea}>
        <TextField
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          label="Your message"
        />
        <Button onClick={sendMessage}>
          Send <SendIcon />
        </Button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/joinMeeting.css";

export default function JoinMeetingModal({ onClose }) {
  const navigate = useNavigate();

  const [meetingCode, setMeetingCode] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleJoin = () => {
    if (!meetingCode.trim()) {
      setError("Meeting code is required");
      return;
    }

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    // ✅ navigate only AFTER validation
    navigate(`/${meetingCode}`, {
      state: { username, isGuest: true },
    });
  };

  return (
    <div className="joinOverlay">
      <div className="joinBox">
        <h2>Join Meeting</h2>

        {error && <p className="errorText">{error}</p>}

        <input
          type="text"
          placeholder="Meeting Code"
          value={meetingCode}
          onChange={(e) => setMeetingCode(e.target.value)}
        />

        <input
          type="text"
          placeholder="Your Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <div className="joinActions">
          <button onClick={handleJoin}>Join</button>
          <button className="cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

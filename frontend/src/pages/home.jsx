import { useNavigate } from "react-router-dom";
import withAuth from "../utils/withAuth";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import "../App.css";
import { Button, IconButton, TextField } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import Typography from "@mui/material/Typography";

function HomeComponent() {
  let navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  let [username, setUsername] = useState("");
  let { addToUserHistory, getUsername } = useContext(AuthContext);

  useEffect(() => {
    let isMounted = true;
    const fetchUsername = async () => {
      try {
        const data = await getUsername();
        if (data && isMounted) setUsername(data.username);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsername();
    return () => {
      isMounted = false;
    };
  }, [getUsername]);

  let handleJoinVideoCall = async () => {
    await addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`, {
      state: { username, isGuest: true },
    });
  };
  return (
    <>
      <div className="homeContainer">
        <div className="landingNav">
          <div className="NavHeader">
            <h1>
              <a onClick={() => {
                navigate("/")
              }}>Zoom</a>
            </h1>
          </div>
          <div className="NavList">
            <IconButton
              onClick={() => navigate("/history")}
              sx={{ color: "white" }}
            >
              <RestoreIcon />
              <Typography sx={{ color: "white", ml: 1 }}>History</Typography>
            </IconButton>
            <Button
              sx={{ color: "red" }}
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/auth");
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
      <div className="greeting">
        <h3>Hi {username || "Loading..."}</h3>
      </div>
      <div className="homeHeroSection">
        <div className="leftPanel">
          <div>
            <div style={{ display: "flex", gap: "10px" }}>
              <TextField
                sx={{
                  input: { color: "white" }, // text
                  label: { color: "white" }, // label
                  "& label.Mui-focused": { color: "white" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#cdd6f4" }, // normal
                    "&:hover fieldset": { borderColor: "#1976d2" }, // hover
                  },
                }}
                onChange={(e) => setMeetingCode(e.target.value)}
                id="outlined-basic"
                label="Meeting Code"
                variant="outlined"
              />
              <Button onClick={handleJoinVideoCall} variant="contained">
                Join
              </Button>
            </div>
          </div>
        </div>
        <div className="rightPanel">
          <img srcSet="/logo3.png" alt="" />
        </div>
      </div>
    </>
  );
}
export default withAuth(HomeComponent);

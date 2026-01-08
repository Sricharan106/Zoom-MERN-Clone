import styles from "../styles/videoComponent.module.css";
import TextField from "@mui/material/TextField";
import Badge from "@mui/material/Badge";
import { useEffect, useState, useRef } from "react";
import Button from "@mui/material/Button";
import io from "socket.io-client";
import IconButton from "@mui/material/IconButton";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import ChatPannel from "./chatPannel";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation, useNavigate } from "react-router-dom";

const server_url = "http://localhost:8080";

var connections = {};

// var winNav = window.navigator;
// var isChrome = window.chrome;
// var isFirefox = winNav.userAgent.indexOf("Firefox") > -1;

// if (isChrome == undefined) {
//   alert("please use chrome");
// }else
// if(isFirefox){
//   alert("u are uisng firefox use idk")
// }

const peerConfigConnections = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
};

export default function VideoMeetComponent() {
  const navigate = useNavigate();
  var socketRef = useRef(null); // keep socket connection alive
  let socketIdRef = useRef(null); // store socket ID without re-render

  let localVideoref = useRef(null); // control <video> DOM directly
  const lobbyVideoRef = useRef(null);
  const meetingVideoRef = useRef(null);

  // chhcks hardware support
  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [screenAvailable, setScreenAvailable] = useState(true);

  // contols like play pause
  let [video, setVideo] = useState(true);
  let [audio, setAudio] = useState(true);
  let [screen, setScreen] = useState(false);

  // chatsection
  let [showModal, setModal] = useState(false);

  // chat-messages
  let [newMessages, setNewMessages] = useState(0); // notification'

  // Joined as guest
  const location = useLocation();

  let [username, setUsername] = useState(location.state?.username || "");

  let [askForUsername, setAskForUsername] = useState(true);

  // DOM references of multiple <video> elements
  const videoRef = useRef([]);

  // List of connected users
  let [videos, setVideos] = useState([]);

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoPermission) {
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
      }
      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (audioPermission) {
        setAudioAvailable(true);
      } else {
        setAudioAvailable(false);
      }
      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }
      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });

        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (lobbyVideoRef.current && userMediaStream) {
            lobbyVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    getPermissions();
  }, []);

  const initLocalStream = async () => {
    if (window.localStream) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: false,
      },
    });

    window.localStream = stream;
  };

  useEffect(() => {
    if (!window.localStream) return;

    if (askForUsername && lobbyVideoRef.current) {
      lobbyVideoRef.current.srcObject = window.localStream;
      lobbyVideoRef.current.play();
    }

    if (!askForUsername && meetingVideoRef.current) {
      meetingVideoRef.current.srcObject = window.localStream;
      meetingVideoRef.current.play();
    }
  }, [askForUsername]);

  let connect = async () => {
    if (!username.trim()) {
      alert("Username is required");
      return;
    }
    await initLocalStream();
    setAskForUsername(false);
    connectToSocketServer();
  };

  const blackSilence = () => {
    return new MediaStream([createBlackVideoTrack(), createSilentAudioTrack()]);
  };

  const createBlackVideoTrack = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const stream = canvas.captureStream();
    const track = stream.getVideoTracks()[0];
    track.enabled = false; // looks off to receiver

    return track;
  };

  const createSilentAudioTrack = () => {
    const ctx = new AudioContext(); // creates new audio like canvas
    const oscillator = ctx.createOscillator(); // Creates an audio signal generator(another sound like sin wave)
    const dst = oscillator.connect(ctx.createMediaStreamDestination()); // mix both

    oscillator.start(); // strts the another audio

    const track = dst.stream.getAudioTracks()[0];
    track.enabled = false; // stoping the orginal one

    return track;
  };

  // answering
  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);
    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId].createAnswer().then((description) => {
                connections[fromId]
                  .setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit(
                      "signal",
                      fromId,
                      JSON.stringify({
                        sdp: connections[fromId].localDescription,
                      })
                    );
                  });
              });
            }
          })
          .catch((err) => console.log(err));
      }
      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((err) => console.log(err));
      }
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });
    socketRef.current.on("signal", gotMessageFromServer);
    socketRef.current.on("connect", () => {
      socketRef.current.emit("joinCall", window.location.href);
      socketIdRef.current = socketRef.current.id;
      socketRef.current.on("chat-message", addMessageNoti); // we got a new message
      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });
      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          if (socketListId === socketIdRef.current) return;

          // Prevent duplcate connectiosn
          if (connections[socketListId]) return;

          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          );
          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          // the other persons is sending there video
          // this runs always because we exchanging data(stream) all the time
          connections[socketListId].ontrack = (event) => {
            const stream = event.streams[0];
            if (!stream) return;

            setVideos((prevVideos) => {
              // If already exists, replace stream
              const exists = prevVideos.find(
                (v) => v.socketId === socketListId
              );
              if (exists) {
                return prevVideos.map((v) =>
                  v.socketId === socketListId ? { ...v, stream } : v
                );
              }
              // Else add new video
              return [...prevVideos, { socketId: socketListId, stream }];
            });
          };

          // sending your stream to others
          if (window.localStream !== undefined && window.localStream !== null) {
            window.localStream.getTracks().forEach((track) => {
              connections[socketListId].addTrack(track, window.localStream);
            });
          } else {
            // we or whatever reason camers is off so insted we send the black screen with logo
            window.localStream = blackSilence();
            window.localStream.getTracks().forEach((track) => {
              connections[socketListId].addTrack(track, window.localStream);
            });
          }
        });

        // offering
        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (socketIdRef.current === id2) continue;
            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description) // storeing my local description for the connection with id2
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription })
                  );
                })
                .catch((err) => console.log(err));
            });
          }
        }
      });
    });
  };

  let addMessageNoti = (data, sender, socketIdSender) => {
    if (socketIdRef.current !== socketIdSender) {
      setNewMessages((prev) => prev + 1);
    }
  };
  let handleScreen = async () => {
    if (!screen) {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const screenTrack = screenStream.getVideoTracks()[0];
      for (let id in connections) {
        const sender = connections[id]
          .getSenders()
          .find((stream) => stream.track?.kind === "video");
        if (sender) sender.replaceTrack(screenTrack);
      }
      meetingVideoRef.current.srcObject = screenStream;
      screenTrack.onended = () => {
        stopScreenShare();
      };
      setScreen(true);
    } else {
      stopScreenShare();
    }
  };

  let stopScreenShare = () => {
    const cameraTrack = window.localStream.getVideoTracks()[0];
    for (let id in connections) {
      const sender = connections[id]
        .getSenders()
        .find((s) => s.track?.kind === "video");

      if (sender) sender.replaceTrack(cameraTrack);
    }

    meetingVideoRef.current.srcObject = window.localStream;
    setScreen(false);
  };
  let handleVideo = () => {
    const videoTrack = window.localStream?.getVideoTracks()[0];

    if (!videoTrack) return;

    videoTrack.enabled = !videoTrack.enabled;
    setVideo(videoTrack.enabled);
  };

  let handleAudio = () => {
    const audioTrack = window.localStream?.getAudioTracks()[0];

    if (!audioTrack) return;

    audioTrack.enabled = !audioTrack.enabled;
    setAudio(audioTrack.enabled);
  };

  let handleEndCall = () => {
    window.localStream?.getTracks().forEach((track) => track.stop());

    for (let id in connections) {
      connections[id].close();
    }

    socketRef.current.disconnect();
    navigate("/home");
  };

  useEffect(() => {
    if (!location.state?.username && !username) {
      setAskForUsername(true);
    }
  }, []);

  let videoStyles = showModal ? { left: "3vh" } : { left: "80vw" };
  return (
    <div className={styles.lobbyContainer}>
      {askForUsername === true ? (
        <div>
          <h2>Enter into lobby</h2>
          <TextField
            variant="outlined"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{
              // input text
              "& .MuiInputBase-input": {
                color: "white",
              },

              // label
              "& .MuiInputLabel-root": {
                color: "white",
              },

              // label when focused
              "& .MuiInputLabel-root.Mui-focused": {
                color: "white",
              },

              // outline border
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "white",
                  borderWidth: "2px",
                },
                "&:hover fieldset": {
                  borderColor: "#1976d2",
                },
              },
            }}
          />

          <Button variant="contained" onClick={connect}>
            Connect
          </Button>
          <div>
            <video ref={lobbyVideoRef} autoPlay muted playsInline />
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContiner}>
          <video
            className={styles.meetUserVideo}
            ref={meetingVideoRef}
            autoPlay
            playsInline
            muted
            style={videoStyles}
          />

          <div className={styles.buttonContainer}>
            <IconButton onClick={handleVideo} style={{ color: "#cdd6f4" }}>
              {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
            <IconButton onClick={handleAudio} style={{ color: "#cdd6f4" }}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
            <IconButton onClick={handleEndCall} style={{ color: "red" }}>
              <CallEndIcon style={{ color: "red" }} />
            </IconButton>
            {screenAvailable === true ? (
              <IconButton onClick={handleScreen} style={{ color: "#cdd6f4" }}>
                {screen === true ? (
                  <ScreenShareIcon />
                ) : (
                  <StopScreenShareIcon />
                )}
              </IconButton>
            ) : (
              <></>
            )}
            {showModal ? (
              <Badge>
                <CloseIcon
                  onClick={() => {
                    setModal((prev) => !prev);
                    setNewMessages(0);
                  }}
                  style={{ color: "red" }}
                />
              </Badge>
            ) : (
              <Badge badgeContent={newMessages} max={999} color="secondary">
                <IconButton
                  onClick={() => {
                    setModal((prev) => !prev);
                    setNewMessages(0);
                  }}
                  style={{ color: "white" }}
                >
                  <ChatIcon />
                </IconButton>
              </Badge>
            )}
          </div>
          <h3>videos length: {videos.length}</h3>

          <div
            className={styles.chatModal}
            style={{ display: showModal ? "block" : "none" }}
          >
            <div className={styles.chatContainer}>
              <div>
                <ChatPannel
                  socketRef={socketRef}
                  socketIdRef={socketIdRef}
                  username={username}
                  onClose={() => setModal(false)}
                />
              </div>
            </div>
          </div>

          <div className={styles.meetAllVideos}>
            {videos.map((video) => (
              <div key={video.socketId}>
                <h2>video.socketId: {video.socketId}</h2>
                <video
                  data-socket={video.socketId}
                  ref={(ref) => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream;
                    }
                  }}
                  autoPlay
                ></video>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

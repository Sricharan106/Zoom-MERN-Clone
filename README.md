# Zoom-MERN-Clone

A Zoom-like video conferencing web application built with the MERN stack (MongoDB, Express, React, Node) and WebRTC for peer-to-peer audio/video. This repository contains two main folders: `backend/` (Express + Socket signaling + MongoDB) and `frontend/` (React + Vite).

---

## 🚀 Live Demo

Link (Live):  
https://zoom-mern-clone-1.onrender.com

---

## Table of contents
- About
- Key features
- Tech stack
- Repository structure
- Important files
- Environment variables
- Local development — backend
- Local development — frontend
- Running (development & production)
- WebRTC & signaling notes
- Troubleshooting

---

## About
Zoom-MERN-Clone is a learning/demo project that implements a multi-user video meeting application using WebRTC for media and a Node/Express backend for signaling and user management. The frontend is built with React (Vite) and the backend uses MongoDB for persistence.

---

## Key features
- Create and join meeting rooms via URL
- Real-time audio/video using WebRTC
- Socket-based signaling server for offer/answer and ICE exchange
- Simple authentication and user routes
- Basic meeting UI (mute/unmute, join/leave, participant video tiles)

---

## Tech stack
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Realtime signaling:** Socket-based signaling (custom socket manager)
- **Database:** MongoDB (Atlas or local)
- **WebRTC:** Browser APIs (`getUserMedia`, `RTCPeerConnection`)
- **Styling:** CSS + Material UI (MUI)

---

## Repository structure
``` bash
backend/
├─ package.json
├─ package-lock.json
└─ src/
├─ app.js # Express app, DB connection, socket setup
├─ routes/ # API routes (/v1/user)
├─ controllers/ # Controller logic
├─ models/ # Mongoose models
└─ utils/
└─ socketmanager.js # WebRTC signaling logic

frontend/
├─ package.json
├─ package-lock.json
├─ vite.config.js
├─ index.html
└─ src/
├─ App.jsx # Router and app entry
├─ main.jsx
├─ pages/ # landing, auth, home, videoMeet, userHistory
├─ contexts/ # AuthContext
├─ styles/
├─ assets/
└─ environment.js # Environment helper
```

---

## Important files
- **`backend/src/app.js`**
  - Loads environment variables
  - Connects to MongoDB (`ATLASDB_URL`)
  - Initializes socket signaling via `connectToSocket(server)`
  - ⚠️ Update CORS origin before local testing

- **`backend/src/utils/socketmanager.js`**
  - Handles SDP offer/answer exchange
  - Handles ICE candidate forwarding

- **`frontend/src/pages/videoMeet.jsx`**
  - Implements WebRTC logic (`getUserMedia`, peer connections)
  - Handles meeting UI

---

## Environment variables

### Backend (`backend/.env`)

- ATLASDB_URL=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/zoom
- PORT=<yourport>

## Local development — backend
```bash
cd backend
npm install
npm run dev
```

## Local development — frontend
```bash
cd frontend
npm install
npm run dev
```
## Open
- http://localhost:yourport

# Make sure backend is running.

## Running the full app (development)

- Start backend and frontend in separate terminals
- Open the app in multiple tabs/devices
- Create or join a room via URL to test peer connections

## WebRTC & signaling notes

- Backend acts only as a signaling relay
- Uses mesh topology (peer-to-peer)
- Suitable for small groups
- For large rooms, use an SFU (mediasoup, Jitsi)
- Configure a TURN server (coturn) for NAT traversal

## Troubleshooting

- No camera/mic: Check browser permissions & HTTPS
- Peers not connecting: Check socket logs & ICE exchange
- CORS errors: Update CORS_ORIGIN
- MongoDB issues: Verify Atlas IP allowlist & credentials

---

## Made with ❤️ by Sricharan

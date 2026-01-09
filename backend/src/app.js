require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const { createServer } = require("node:http");
const { connectToSocket } = require("./utils/socketmanager.js");
const cors = require("cors");
const userRoutes = require("./routes/user.routes.js");

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 3000);
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));
app.use(
  cors({
    origin: "https://zoom-mern-clone-1.onrender.com",
    credentials: true,
  })
);

app.use("/v1/user", userRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

const start = async () => {
  // MongoDB Connection
  const localUrl = "mongodb://127.0.0.1:27017/zoom";
  const altasUrl = process.env.ATLASDB_URL;
  mongoose
    .connect(altasUrl)
    .then(() => console.log("Connection successful"))
    .catch((err) => console.error(err));
  server.listen(app.get("port"), () =>
    console.log(`app is listing at ${app.get("port")}`)
  );
};

start();

const httpStatus = require("http-status-codes");
const bcrypt = require("bcrypt");
const User = require("../models/user.model.js");
const asyncHandler = require("../utils/wrapAsync");
const crypto = require("crypto");
const Meeting = require("../models/meeting.model.js");

module.exports.register = asyncHandler(async (req, res) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res
      .status(httpStatus.StatusCodes.BAD_REQUEST)
      .json({ message: "Please provide valid information" });
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res
      .status(httpStatus.StatusCodes.CONFLICT)
      .json({ message: "Username is already taken" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    username,
    password: hashedPassword,
  });

  res
    .status(httpStatus.StatusCodes.CREATED)
    .json({ message: "User successfully registered" });
});

module.exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(httpStatus.StatusCodes.BAD_REQUEST)
      .json({ message: "Please provide valid information" });
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res
      .status(httpStatus.StatusCodes.NOT_FOUND)
      .json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (isMatch) {
    const token = crypto.randomBytes(20).toString("hex");

    user.token = token;
    await user.save();
    return res.status(httpStatus.StatusCodes.OK).json({ token: token });
  }
  return res
    .status(httpStatus.StatusCodes.UNAUTHORIZED)
    .json({ message: "Invalid password" });
});

module.exports.getUserHistory = asyncHandler(async (req, res) => {
  const { token } = req.query;
  const user = await User.findOne({ token: token });
  const meetings = await Meeting.find({
    user_id: user.username,
  });
  res.json(meetings);
});

module.exports.addToHistory = asyncHandler(async (req, res) => {
  const { token, meetingcode } = req.body;
  if (!meetingcode) {
    return res.status(400).json({ message: "meetingcode is required" });
  }
  const user = await User.findOne({ token: token });
  if (!user) {
    return res.status(401).json({ message: "Invalid token" });
  }
  const newMeeting = new Meeting({
    user_id: user.username,
    meetingcode,
  });
  await newMeeting.save();
  res.status(httpStatus.StatusCodes.CREATED).json({
    message: "Meeting added to history",
  });
});

module.exports.getUsername = asyncHandler(async (req, res) => {
  const { token } = req.query;
  const user = await User.findOne({ token: token });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.json({ username: `${user.username}` });
});

module.exports.validateToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  const user = await User.findOne({ token: token });
  if (!user) {
    return res.status(401).json({ message: "Invalid token" });
  }
  return res.status(200).json({ username: user.username });
});

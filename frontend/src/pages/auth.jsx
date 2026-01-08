import "../App.css";

import { useState, useContext } from "react";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { AuthContext } from "../contexts/AuthContext";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";

export default function Authentication() {
  const navigate = useNavigate();
  const { handleRegister, handelLogin } = useContext(AuthContext);
  const [mode, setmode] = useState("signup");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setform] = useState({
    name: "",
    username: "",
    password: "",
    conformPassword: "",
  });
  const handelChange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value });
  };
  const handelSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === "login") {
        const result = await handelLogin({
          username: form.username,
          password: form.password,
        });
        console.log(result);
        setMessage(result.message);
        setError(null);
      } else {
        if (form.password !== form.conformPassword) {
          throw new Error("Passwords do not match");
        }
        const result = await handleRegister({
          name: form.name,
          username: form.username,
          password: form.password,
        });
        console.log(result);
        setMessage(result.message);
        setError(null);
        setmode("login");
      }
      setOpen(true);
    } catch (err) {
      setMessage(null);
      setError(err.message);
      setOpen(true);
    }
  };

  const handelmode = (e) => {
    e.preventDefault();
    if (mode === "login") {
      setmode("signup");
    } else {
      setmode("login");
    }
    setform({
      name: "",
      username: "",
      password: "",
      conformPassword: "",
    });
    setError(null);
    setMessage(null);
  };

  return (
    <div className="AuthContainer">
      <a
        onClick={() => {
          navigate("/");
        }}
      >
        <ArrowBackIcon />
      </a>
      <h1>{mode === "login" ? "Login" : "Signup"}</h1>
      <br />
      <form onSubmit={handelSubmit}>
        {mode === "signup" && (
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
            id="outlined-basic"
            type="text"
            name="name"
            label="Name"
            onChange={handelChange}
            value={form.name}
          />
        )}
        <TextField
          sx={{
            input: { color: "white" }, // text
            label: { color: "white" }, // label
            "& label.Mui-focused": { color: "white" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#cdd6f4",
                background: "transpreant",
              }, // normal
              "&:hover fieldset": { borderColor: "#1976d2" }, // hover
            },
          }}
          type="text"
          name="username"
          label="Username"
          onChange={handelChange}
          value={form.username}
        />
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
          type="password"
          name="password"
          label="Password"
          onChange={handelChange}
          value={form.password}
        />

        {mode === "signup" && (
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
            type="password"
            name="conformPassword"
            label="Conform Password"
            onChange={handelChange}
            value={form.conformPassword}
          />
        )}
        <p className="error">{error}</p>
        <Button variant="outlined" type="submit">
          {mode === "login" ? "Login" : "Create Account"}
        </Button>
      </form>
      <p>
        {mode === "login" ? (
          <Link onClick={handelmode} underline="hover">
            Don't have an account
          </Link>
        ) : (
          <Link onClick={handelmode} underline="hover">
            Already have an account?
          </Link>
        )}
      </p>
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
      >
        <MuiAlert
          severity={error ? "error" : "success"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {message || error}
        </MuiAlert>
      </Snackbar>
    </div>
  );
}

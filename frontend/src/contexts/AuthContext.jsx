import axios from "axios";
import httpStatus from "http-status";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: "http://localhost:8080/v1/user",
});

export const AuthProvider = ({ children }) => {
  const authContext = useContext(AuthContext);
  const [userData, setUserData] = useState(authContext);
  const router = useNavigate();
  const handleRegister = async ({ name, username, password }) => {
    try {
      let request = await client.post("/register", {
        name: name,
        username: username,
        password: password,
      });
      console.log(request);
      return request.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  };
  const handelLogin = async ({ username, password }) => {
    try {
      let request = await client.post("/login", {
        username: username,
        password: password,
      });

      if (request.status === httpStatus.OK) {
        localStorage.setItem("token", request.data.token);
        router("/home");
      }
      return request.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };
  const getHistoryOfUser = async () => {
    try {
      let request = await client.get("/get_all_activity", {
        params: {
          token: localStorage.getItem("token"),
        },
      });
      return request.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "getting activity failed"
      );
    }
  };
  const addToUserHistory = async (meetingcode) => {
    try {
      let request = await client.post("/add_to_activity", {
        token: localStorage.getItem("token"),
        meetingcode: meetingcode,
      });

      return request.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "adding activity failed"
      );
    }
  };

  const getUsername = async () => {
    try {
      let request = await client.get("/getUsername", {
        params: {
          token: localStorage.getItem("token"),
        },
      });
      return request.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "getting username failed"
      );
    }
  };

  const validateToken = async () => {
    try {
      let request = await client.post("/validateToken", {
        token: localStorage.getItem("token"),
      });
      return request.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "getting username failed"
      );
    }
  };

  const data = {
    userData,
    setUserData,
    addToUserHistory,
    getHistoryOfUser,
    handleRegister,
    handelLogin,
    getUsername,
    validateToken,
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};

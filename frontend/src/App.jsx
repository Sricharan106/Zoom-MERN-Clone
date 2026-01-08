import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing";
import Authentication from "./pages/auth";
import { AuthProvider } from "./contexts/AuthContext";
import VideoMeetComponent from "./pages/videoMeet";
import HomeComponent from "./pages/home";
import UserHistory from "./pages/userHistory";

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />}></Route>
            <Route path="/auth" element={<Authentication />} />
            <Route path="/home" element={<HomeComponent />} />
            <Route path="/history" element={<UserHistory />} />

            <Route path="/:url" element={<VideoMeetComponent />} />

          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;

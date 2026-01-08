import "../App.css";
import { useState } from "react";
import JoinMeetingModal from "./JoinMeetingModal";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  const [openJoin, setOpenJoin] = useState(false);

  return (
    <div className="landingConatainer">
      <div className="landingNav">
        <div className="NavHeader">
          <h1>
            <a onClick={() => {
              navigate("/")
            }}>Zoom</a>
          </h1>
        </div>

        <div className="NavList">
          <button className="NavButtons" onClick={() => setOpenJoin(true)}>
            Join as Guest
          </button>

          <a
            className="NavButtons"
            onClick={() => {
              navigate("/auth");
            }}
          >
            Register
          </a>

          <a
            className="NavButtons"
            id="Navlogin"
            onClick={() => {
              navigate("/auth");
            }}
          >
            Login
          </a>
        </div>
      </div>

      <div className="LandingHero">
        <div className="LandingHeroText">
          <h2>
            <span>Connect</span> with your Loved Ones
          </h2>
          <p>Cover a distance by zoom</p>
          <a
            id="Navlogin"
            onClick={() => {
              navigate("/auth");
            }}
          >
            Get Started
          </a>
        </div>

        <div className="LandingHeroLogo">
          <img src="mobile.png" alt="" />
        </div>
      </div>

      {openJoin && <JoinMeetingModal onClose={() => setOpenJoin(false)} />}
    </div>
  );
}

import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function withAuth(WrappedComponent) {
  return function AuthComponent(props) {
    const navigate = useNavigate();
    const { validateToken } = useContext(AuthContext);

    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkAuth = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/auth");
          return;
        }

        try {
          const data = await validateToken();
          setUsername(data.username);
        } catch (err) {
          console.error(err);
          navigate("/auth");
        } finally {
          setLoading(false);
        }
      };

      checkAuth();
    }, [navigate, validateToken]);

    if (loading) return null; // or loader

    return <WrappedComponent {...props} />;
  };
}

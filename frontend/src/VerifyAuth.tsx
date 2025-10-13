import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "./AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function VerifyAuth() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading" // Union type: status can only be one of these 3 values, start with loading when page loads
  );
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  // Extract token from URL when component mount

  useEffect(() => {
    const verifyToken = async () => {
      // Get token from URL (?token=abc123)
      const token = searchParams.get("token");
      const redirectTo = searchParams.get("redirect") || "/";

      if (!token) {
        setStatus("error");
        setError("No token provided");
        return;
      }

      try {
        // Call backend to verify token: GET auth/verify-token?token=abc123
        const response = await fetch(
          `${API_URL}/auth/verify-token?token=${token}`
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to verify token");
        }
        // backend returns JWT and user data
        const data = await response.json();

        // Log user in (save to AuthContext + localStorage)
        login(data.token, data.user);

        setStatus("success");

        // Redirect after short delay (so user sees success message)
        setTimeout(() => {
          navigate(redirectTo);
        }, 1000);
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    };

    verifyToken();
  }, [searchParams, login, navigate]); // useEffect with dependencies: the array tells React when to rerun this effect if these change

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "100px auto",
        padding: "20px",
        textAlign: "center",
      }}
    >
      {status === "loading" && (
        <>
          <h2>Verifying your login...</h2>
          <p>Please wait</p>
        </>
      )}

      {status === "success" && (
        <>
          <h2>✓ Success!</h2>
          <p>Logging you in...</p>
        </>
      )}

      {status === "error" && (
        <>
          <h2>Login failed</h2>
          <p style={{ color: "red" }}>{error}</p>
          <button
            onClick={() => navigate("/login")}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </>
      )}
    </div>
  );
}

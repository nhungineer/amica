import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { colors, commonStyles } from "./styles";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function Login() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState(""); // Add name to login form
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/send-magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          redirectTo,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send magic link");
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div style={commonStyles.pageContainer}>
        <div
          style={{
            ...commonStyles.card,
            maxWidth: "500px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              margin: "0 auto 24px",
              backgroundColor: "#d1fae5",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
            }}
          >
            ✉️
          </div>
          <h1 style={{ ...commonStyles.heading, marginBottom: "16px" }}>
            Check your email!
          </h1>
          <p
            style={{
              ...commonStyles.subheading,
              fontSize: "15px",
              lineHeight: "1.6",
            }}
          >
            We sent a magic link to{" "}
            <strong style={{ color: colors.text }}>{email}</strong>
          </p>
          <p
            style={{
              color: colors.textLight,
              fontSize: "14px",
              lineHeight: "1.6",
            }}
          >
            Click the link in the email to log in. The link will expire in 15
            minutes.
          </p>
          <div
            style={{
              marginTop: "32px",
              padding: "16px",
              backgroundColor: colors.background,
              borderRadius: "8px",
              border: `2px solid ${colors.border}`,
            }}
          >
            <p style={{ margin: 0, fontSize: "13px", color: colors.textLight }}>
              💡 <strong>Tip:</strong> Check your spam folder if you don't see
              the email
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={commonStyles.pageContainer}>
      <div style={{ ...commonStyles.card, maxWidth: "450px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            style={{
              ...commonStyles.heading,
              fontSize: "28px",
              marginBottom: "8px",
            }}
          >
            Welcome to Amica
          </h1>
          <p style={commonStyles.subheading}>
            Sign in to create and join gatherings
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <div>
            <label style={commonStyles.label}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              style={commonStyles.input}
            />
            <p style={commonStyles.helperText}>
              How you'll appear to others in gatherings
            </p>
          </div>

          <div>
            <label style={commonStyles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              style={commonStyles.input}
            />
            <p style={commonStyles.helperText}>
              We'll send you a magic link to sign in
            </p>
          </div>

          {error && <div style={commonStyles.errorBox}>⚠️ {error}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...commonStyles.buttonPrimary,
              width: "100%",
              padding: "14px",
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              backgroundColor: loading ? colors.border : colors.primary,
            }}
            onMouseEnter={
              loading
                ? undefined
                : (e) => {
                    e.currentTarget.style.backgroundColor = colors.primaryHover;
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(99,102, 241, 0.4)";
                  }
            }
            onMouseLeave={
              loading
                ? undefined
                : (e) => {
                    e.currentTarget.style.backgroundColor = colors.primary;
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }
            }
          >
            {loading ? "Sending..." : "Send magic link"}
          </button>
        </form>

        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            backgroundColor: colors.background,
            borderRadius: "8px",
            border: `2px dashed ${colors.border}`,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: colors.textLight,
              textAlign: "center",
            }}
          >
            🔒 <strong>Secure & passwordless</strong> - No password required
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "./config";
import { useAuth } from "./AuthContext";
export function CreateGathering() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    navigate("/login?redirect=/");
    return null;
  }
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [timezone, setTimezone] = useState("Australia/Melbourne");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !location) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For now, hardcode some test data for time options
      const gatheringData = {
        title,
        location,
        timezone,
        timeOptions: [
          {
            start: "2025-10-11T09:00:00Z",
            end: "2025-10-11T11:00:00Z",
            label: "Saturday 9am",
          },
          {
            start: "2025-10-11T12:00:00Z",
            end: "2025-10-11T14:00:00Z",
            label: "Saturday 12pm",
          },
          {
            start: "2025-10-12T10:00:00Z",
            end: "2025-10-12T12:00:00Z",
            label: "Sunday 10am",
          },
        ],
        rsvpDeadline: "2025-10-10T12:00:00Z",
      };

      const response = await fetch(`${API_URL}/gatherings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ← Add JWT!
        },
        body: JSON.stringify(gatheringData),
      });

      if (!response.ok) {
        throw new Error("Failed to create gathering");
      }

      const data = await response.json();
      console.log("Created gathering:", data);

      // Navigate to results page for the new gathering
      navigate(`/gathering/${data.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create gathering"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
      <h1>Create New Gathering</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Gathering Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Weekend Brunch"
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "14px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
            required
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Location *
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Melbourne, VIC, Australia"
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "14px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
            required
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "14px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          >
            <option value="Australia/Melbourne">Australia/Melbourne</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
          </select>
        </div>

        {error && <p style={{ color: "red" }}>❌ {error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 24px",
            backgroundColor: loading ? "#ccc" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "Creating..." : "Create Gathering"}
        </button>
      </form>

      <p style={{ marginTop: "20px", fontSize: "12px", color: "#666" }}>
        * Required fields. Time options are pre-set for testing.
      </p>
    </div>
  );
}

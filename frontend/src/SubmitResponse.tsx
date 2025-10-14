import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "./config";
import { useAuth, fetchWithAuth } from "./AuthContext";

type TimeOption = {
  start: string;
  end: string;
  label: string;
};

export function SubmitResponse() {
  // Get gathering ID from URL parameter
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Get auth state and token
  const { user, token, isAuthenticated } = useAuth();

  // State for time options (fetched from gathering)
  const [timeOptions, setTimeOptions] = useState<TimeOption[]>([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<number[]>([]);
  const [budgetMax, setBudgetMax] = useState("");
  const [cuisinePreferences, setCuisinePreferences] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authentication on component mount
  useEffect(() => {
    // Don't redirect if we're already on the login page
    // This prevents a redirect loop
    const currentPath = window.location.pathname;

    if (!isAuthenticated && user === null && token === null) {
      // Only redirect if we're not already on the login page
      if (
        !currentPath.includes("/login") &&
        !currentPath.includes("/auth/verify")
      ) {
        navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      }
    }
  }, [isAuthenticated, user, token, navigate]);

  // Fetch gathering data to get time options
  useEffect(() => {
    const fetchGathering = async () => {
      if (!id) return;

      try {
        const response = await fetch(`${API_URL}/gatherings/${id}`);
        const data = await response.json();
        setTimeOptions(data.timeOptions);
      } catch (error) {
        console.error("Error fetching gathering:", error);
        setError("Failed to load gathering details");
      }
    };

    fetchGathering();
  }, [id]);

  const handleTimeSlotToggle = (index: number) => {
    if (selectedTimeSlots.includes(index)) {
      // Remove if already selected
      setSelectedTimeSlots(selectedTimeSlots.filter((i) => i !== index));
    } else {
      // Add if not selected
      setSelectedTimeSlots([...selectedTimeSlots, index]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedTimeSlots.length === 0) {
      setError("Please select at least one time slot");
      return;
    }

    // Double-check authentication before submitting
    if (!token) {
      setError("You must be logged in to submit a response");
      navigate(
        `/login?redirect=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const responseData = {
        gatheringId: id,
        // NO userId here! Backend will get it from token
        availableTimeSlotIndices: selectedTimeSlots,
        budgetMax: budgetMax ? parseInt(budgetMax) : null,
        cuisinePreferences: cuisinePreferences
          ? cuisinePreferences.split(",").map((c) => c.trim())
          : [],
        dietaryRestrictions: dietaryRestrictions || null,
      };

      // Use fetchWithAuth to automatically include JWT token
      const response = await fetchWithAuth("/responses", token, {
        method: "POST",
        body: JSON.stringify(responseData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit response");
      }

      const data = await response.json();
      console.log("Response submitted:", data);

      // Reset form
      setSelectedTimeSlots([]);
      setBudgetMax("");
      setCuisinePreferences("");
      setDietaryRestrictions("");

      // Navigate back to results page
      navigate(`/gathering/${id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit response"
      );
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking auth
  if (!isAuthenticated) {
    return <div>Checking authentication...</div>;
  }

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "20px auto",
        padding: "20px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
      }}
    >
      <h2>Submit Your Response</h2>

      {/* Show who is logged in */}
      <p style={{ marginBottom: "20px", color: "#666" }}>
        Responding as: <strong>{user?.name || user?.email}</strong>
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        {/* REMOVED: User dropdown - we know who they are from auth! */}

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "10px",
              fontWeight: "bold",
            }}
          >
            When are you available? * (Select all that work)
          </label>
          {timeOptions.map((option, index) => (
            <div key={index} style={{ marginBottom: "8px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedTimeSlots.includes(index)}
                  onChange={() => handleTimeSlotToggle(index)}
                  style={{ width: "18px", height: "18px" }}
                />
                <span>{option.label}</span>
              </label>
            </div>
          ))}
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Budget Max ($ per person)
          </label>
          <input
            type="number"
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
            placeholder="e.g., 30"
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "14px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
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
            Cuisine Preferences (comma separated)
          </label>
          <input
            type="text"
            value={cuisinePreferences}
            onChange={(e) => setCuisinePreferences(e.target.value)}
            placeholder="e.g., Italian, Japanese, Thai"
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "14px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
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
            Dietary Restrictions
          </label>
          <input
            type="text"
            value={dietaryRestrictions}
            onChange={(e) => setDietaryRestrictions(e.target.value)}
            placeholder="e.g., vegetarian, gluten-free"
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "14px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 24px",
            backgroundColor: loading ? "#ccc" : "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "Submitting..." : "Submit Response"}
        </button>
      </form>
    </div>
  );
}

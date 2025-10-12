import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "./config";

type TimeOption = {
  start: string;
  end: string;
  label: string;
};

export function SubmitResponse() {
  // Get gathering ID from URL parameter
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State for time options (fetched from gathering)
  const [timeOptions, setTimeOptions] = useState<TimeOption[]>([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<number[]>([]);
  const [budgetMax, setBudgetMax] = useState("");
  const [cuisinePreferences, setCuisinePreferences] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    if (selectedTimeSlots.length === 0 || !selectedUser) {
      setError("Please select at least one time slot and choose a user");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const responseData = {
        gatheringId: id,
        userId: selectedUser,
        availableTimeSlotIndices: selectedTimeSlots,
        budgetMax: budgetMax ? parseInt(budgetMax) : null,
        cuisinePreferences: cuisinePreferences
          ? cuisinePreferences.split(",").map((c) => c.trim())
          : [],
        dietaryRestrictions: dietaryRestrictions || null,
      };

      const response = await fetch(`${API_URL}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      setSelectedUser("");

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
            Responding as: *
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "14px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
            required
          >
            <option value="">-- Select User --</option>
            <option value="9ca01e21-9725-4fed-a44c-0262c704c8a6">Bob</option>
            <option value="7c932a32-2c6e-4f7b-96e8-f45efc77065d">
              Charlie
            </option>
            <option value="5648f6b3-f335-4c13-a09e-821ff8db6d8a">Alice</option>
          </select>
        </div>

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

        {error && <p style={{ color: "red" }}>❌ {error}</p>}

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

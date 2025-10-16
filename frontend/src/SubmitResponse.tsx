import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "./config";
import { useAuth, fetchWithAuth } from "./AuthContext";
import { colors, commonStyles, buttonHoverEffect } from "./styles";
import {
  CUISINE_OPTIONS,
  DIETARY_RESTRICTIONS,
  combineDietaryInfo,
} from "./formOptions";

type TimeOption = {
  start: string;
  end: string;
  label: string;
};

export function SubmitResponse() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();

  const [timeOptions, setTimeOptions] = useState<TimeOption[]>([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<number[]>([]);
  const [budgetMax, setBudgetMax] = useState("");
  const [cuisinePreferences, setCuisinePreferences] = useState<string[]>([]);
  const [dietaryCheckboxes, setDietaryCheckboxes] = useState<string[]>([]);
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authentication on component mount
  useEffect(() => {
    const currentPath = window.location.pathname;

    if (!isAuthenticated && user === null && token === null) {
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
      setSelectedTimeSlots(selectedTimeSlots.filter((i) => i !== index));
    } else {
      setSelectedTimeSlots([...selectedTimeSlots, index]);
    }
  };
  // Toggle cuisine checkbox
  const handleCuisineToggle = (cuisine: string) => {
    if (cuisinePreferences.includes(cuisine)) {
      // Already selected → remove it
      setCuisinePreferences(cuisinePreferences.filter((c) => c !== cuisine));
    } else {
      // Not selected → add it

      setCuisinePreferences([...cuisinePreferences, cuisine]);
    }
  };

  // Toggle dietary checkbox
  const handleDietaryToggle = (restriction: string) => {
    if (dietaryCheckboxes.includes(restriction)) {
      setDietaryCheckboxes(dietaryCheckboxes.filter((r) => r !== restriction));
    } else {
      setDietaryCheckboxes([...dietaryCheckboxes, restriction]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedTimeSlots.length === 0) {
      setError("Please select at least one time slot");
      return;
    }

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
        availableTimeSlotIndices: selectedTimeSlots,
        budgetMax: budgetMax ? parseInt(budgetMax) : null,
        cuisinePreferences: cuisinePreferences, // ← Already an array!
        dietaryRestrictions: combineDietaryInfo(
          dietaryCheckboxes,
          dietaryNotes
        ), // ← Use helper
      };

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
      setCuisinePreferences([]); // ← Reset to empty array
      setDietaryCheckboxes([]); // ← Add this
      setDietaryNotes(""); // ← Add this

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
    return (
      <div style={commonStyles.pageContainer}>
        <div style={{ ...commonStyles.card, textAlign: "center" }}>
          <p style={{ color: colors.textLight }}>Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={commonStyles.pageContainer}>
      <div style={commonStyles.card}>
        <h1 style={commonStyles.heading}>Submit Your Response</h1>

        {/* Show who is logged in */}
        <div
          style={{
            backgroundColor: colors.background,
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "24px",
            border: `2px solid ${colors.border}`,
          }}
        >
          <p style={{ margin: 0, color: colors.textLight, fontSize: "14px" }}>
            Responding as:{" "}
            <strong style={{ color: colors.text }}>
              {user?.name || user?.email}
            </strong>
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          {/* Time Slots Selection */}
          <div>
            <label style={{ ...commonStyles.label, fontSize: "16px" }}>
              When are you available? * (Select all that work)
            </label>
            <div
              style={{
                backgroundColor: colors.background,
                padding: "16px",
                borderRadius: "8px",
                border: `2px solid ${colors.border}`,
              }}
            >
              {timeOptions.map((option, index) => (
                <label
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px",
                    marginBottom: "8px",
                    cursor: "pointer",
                    borderRadius: "6px",
                    backgroundColor: selectedTimeSlots.includes(index)
                      ? "#e0f2fe"
                      : "transparent",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedTimeSlots.includes(index)) {
                      e.currentTarget.style.backgroundColor = "#f1f5f9";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedTimeSlots.includes(index)) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedTimeSlots.includes(index)}
                    onChange={() => handleTimeSlotToggle(index)}
                    style={{
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                      accentColor: colors.primary,
                    }}
                  />
                  <span style={{ fontSize: "15px", color: colors.text }}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Budget Max */}
          <div>
            <label style={commonStyles.label}>Budget Max ($ per person)</label>
            <input
              type="number"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              placeholder="e.g., 30"
              style={commonStyles.input}
            />
          </div>

          {/* Cuisine Preferences */}
          <div>
            <label style={{ ...commonStyles.label, fontSize: "16px" }}>
              Cuisine Preferences (Select all you like)
            </label>
            <div
              style={{
                backgroundColor: colors.background,
                padding: "16px",
                borderRadius: "8px",
                border: `2px solid ${colors.border}`,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: "10px",
              }}
            >
              {CUISINE_OPTIONS.map((cuisine) => (
                <label
                  key={cuisine}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px",
                    cursor: "pointer",
                    borderRadius: "6px",
                    backgroundColor: cuisinePreferences.includes(cuisine)
                      ? "#e0f2fe"
                      : "transparent",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!cuisinePreferences.includes(cuisine)) {
                      e.currentTarget.style.backgroundColor = "#f1f5f9";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!cuisinePreferences.includes(cuisine)) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={cuisinePreferences.includes(cuisine)}
                    onChange={() => handleCuisineToggle(cuisine)}
                    style={{
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                      accentColor: colors.primary,
                    }}
                  />
                  <span style={{ fontSize: "14px", color: colors.text }}>
                    {cuisine}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <label style={{ ...commonStyles.label, fontSize: "16px" }}>
              Dietary Restrictions
            </label>
            <div
              style={{
                backgroundColor: colors.background,
                padding: "16px",
                borderRadius: "8px",
                border: `2px solid ${colors.border}`,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: "10px",
                marginBottom: "12px",
              }}
            >
              {DIETARY_RESTRICTIONS.map((restriction) => (
                <label
                  key={restriction}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px",
                    cursor: "pointer",
                    borderRadius: "6px",
                    backgroundColor: dietaryCheckboxes.includes(restriction)
                      ? "#fef3c7"
                      : "transparent",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!dietaryCheckboxes.includes(restriction)) {
                      e.currentTarget.style.backgroundColor = "#f1f5f9";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!dietaryCheckboxes.includes(restriction)) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={dietaryCheckboxes.includes(restriction)}
                    onChange={() => handleDietaryToggle(restriction)}
                    style={{
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                      accentColor: colors.warning,
                    }}
                  />
                  <span style={{ fontSize: "14px", color: colors.text }}>
                    {restriction}
                  </span>
                </label>
              ))}
            </div>

            {/* Additional dietary notes text field */}
            <label
              style={{
                ...commonStyles.label,
                fontSize: "14px",
                marginTop: "8px",
              }}
            >
              Additional dietary notes (optional)
            </label>
            <input
              type="text"
              value={dietaryNotes}
              onChange={(e) => setDietaryNotes(e.target.value)}
              placeholder="e.g., severe peanut allergy,lactose intolerant"
              style={commonStyles.input}
            />
          </div>

          {/* Error Message */}
          {error && <div style={commonStyles.errorBox}>⚠️ {error}</div>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...commonStyles.buttonPrimary,
              width: "100%",
              padding: "16px",
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              backgroundColor: loading ? colors.border : colors.success,
            }}
            onMouseEnter={loading ? undefined : buttonHoverEffect.success.enter}
            onMouseLeave={loading ? undefined : buttonHoverEffect.success.leave}
          >
            {loading ? "Submitting..." : "Submit Response"}
          </button>
        </form>
      </div>
    </div>
  );
}

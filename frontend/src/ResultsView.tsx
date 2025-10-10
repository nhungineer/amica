import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ResultsView.css";

// TypeScript types (duplicated from App.tsx for now)
type TimeOption = {
  start: string;
  end: string;
  label: string;
};

type Response = {
  id: string;
  userId: string;
  availableTimeSlotIndices: number[];
  budgetMax: number;
  cuisinePreferences: string[];
  dietaryRestrictions: string | null;
  user: {
    name: string;
    email: string;
  } | null;
};

type PreferenceAnalysis = {
  recommendedTimeSlot: {
    index: number;
    label: string;
    availableCount: number;
  };
  budgetRange: {
    min: number;
    max: number;
    currency: string;
  };
  cuisinePreferences: string[];
  dietaryRestrictions: string[];
  summary: string;
};

type VenueRecommendation = {
  name: string;
  address: string;
  rating: number;
  priceLevel: number;
  cuisine: string;
  reason: string;
};

type Gathering = {
  id: string;
  title: string;
  location: string;
  status: string;
  timeOptions: TimeOption[];
  responses: Response[];
  agentOutput: {
    preferenceAnalysis: PreferenceAnalysis;
    venueRecommendation: {
      recommendations: VenueRecommendation[];
      recommendation: string;
      searchedAt: string;
      location: string;
    };
  } | null;
};

export function ResultsView() {
  // Get gathering ID from URL parameter
  const { id } = useParams<{ id: string }>();

  // Hook for programmatic navigation
  const navigate = useNavigate();

  // State for gathering data and loading
  const [gathering, setGathering] = useState<Gathering | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);

  // Function to fetch gathering data from backend
  const fetchGathering = async (gatheringId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/gatherings/${gatheringId}`);
      const data = await response.json();
      console.log("Fetched gathering:", data);
      setGathering(data);
    } catch (error) {
      console.error("Error fetching gathering:", error);
    }
  };

  // Fetch gathering when component mounts or when ID changes
  useEffect(() => {
    if (id) {
      fetchGathering(id);
    }
  }, [id]);  // Re-run if ID in URL changes

  // Function to trigger AI agents
  const handleAgentTrigger = async () => {
    if (!gathering) return;

    setAgentLoading(true);

    try {
      console.log("Triggering agent for gathering:", gathering.id);

      const response = await fetch(
        `http://localhost:3000/agent-trigger/${gathering.id}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to trigger agent");
      }

      console.log("Agent completed! Refreshing gathering data...");
      await fetchGathering(gathering.id);
    } catch (error) {
      console.error("Error triggering agent:", error);
    } finally {
      setAgentLoading(false);
    }
  };

  // Show loading while fetching
  if (!gathering) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Loading gathering...
      </div>
    );
  }

  // Render results view
  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Action buttons */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => navigate(`/gathering/${gathering.id}/respond`)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          📝 Submit Response
        </button>

        <button
          onClick={() => fetchGathering(gathering.id)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          🔄 Refresh
        </button>

        {/* Only show if we have responses but no agent output yet */}
        {gathering.responses.length > 0 && !gathering.agentOutput && (
          <button
            onClick={handleAgentTrigger}
            disabled={agentLoading}
            style={{
              padding: "10px 20px",
              backgroundColor: agentLoading ? "#ccc" : "#FF9800",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: agentLoading ? "not-allowed" : "pointer",
              fontWeight: "bold",
            }}
          >
            {agentLoading ? "🤖 Running Agent..." : "🤖 Trigger Agent"}
          </button>
        )}
      </div>

      {/* Waiting for responses message */}
      {gathering.responses.length === 0 && (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "#666",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <h3>👥 Waiting for Responses</h3>
          <p>
            Click "Submit Response" above to add responses from Bob, Charlie, or
            Alice!
          </p>
          <p>
            <small>
              Once you have responses, you can trigger the agent to get venue
              recommendations.
            </small>
          </p>
        </div>
      )}

      <div className="results-container">
        {/* LEFT COLUMN */}
        <div className="left-column">
          <div className="gathering-plan">
            <h2>Gathering Plan</h2>
            <p>🍽️ {gathering.title}</p>
            <p>📍 {gathering.location}</p>
            <p>
              📅{" "}
              {
                gathering.agentOutput?.preferenceAnalysis.recommendedTimeSlot
                  .label
              }
            </p>
          </div>

          <div className="responses-section">
            <h3>Responses</h3>
            <p>{gathering.responses.length} responded, 0 pending</p>

            {gathering.responses.map((response, idx) => (
              <div key={response.id} className="response-item">
                <p>
                  <strong>{response.user?.name || `Person ${idx + 1}`}</strong>
                </p>
                <p>
                  📅{" "}
                  {response.availableTimeSlotIndices
                    .map((i) => gathering.timeOptions[i].label)
                    .join(", ")}
                </p>
                <p>
                  🍴 {response.cuisinePreferences.join(", ") || "No preference"}
                </p>
                <p>💰 ${response.budgetMax} per person max</p>
                {response.dietaryRestrictions && (
                  <p>🥗 {response.dietaryRestrictions}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="right-column">
          <div className="preferences-section">
            <h2>Group Preferences Analysis</h2>

            <div className="preferences-grid">
              <div>
                <h4>Availability</h4>
                <p>
                  {
                    gathering.agentOutput?.preferenceAnalysis
                      .recommendedTimeSlot.label
                  }
                </p>
                <small>
                  {
                    gathering.agentOutput?.preferenceAnalysis
                      .recommendedTimeSlot.availableCount
                  }{" "}
                  people available
                </small>
              </div>

              <div>
                <h4>Budget Range</h4>
                <p>
                  ${gathering.agentOutput?.preferenceAnalysis.budgetRange.min}-$
                  {gathering.agentOutput?.preferenceAnalysis.budgetRange.max}
                </p>
                <small>
                  {
                    gathering.agentOutput?.preferenceAnalysis.budgetRange
                      .currency
                  }
                </small>
              </div>

              <div>
                <h4>Preferences</h4>
                <p>
                  {gathering.agentOutput?.preferenceAnalysis.cuisinePreferences.join(
                    ", "
                  )}
                </p>
                <small>
                  {gathering.agentOutput?.preferenceAnalysis.dietaryRestrictions.join(
                    ", "
                  )}
                </small>
              </div>
            </div>
          </div>

          <div className="recommendations-section">
            <h2>Recommendations</h2>
            <p className="recommendation-text">
              {gathering.agentOutput?.venueRecommendation.recommendation}
            </p>
            <div className="venue-grid">
              {gathering.agentOutput?.venueRecommendation.recommendations.map(
                (venue) => (
                  <div key={venue.name} className="venue-card">
                    <h3>{venue.name}</h3>
                    <p className="venue-address">{venue.address}</p>
                    <div className="venue-stats">
                      <span>⭐ {venue.rating}</span>
                      <span>{"$".repeat(venue.priceLevel)}</span>
                    </div>
                    <p className="venue-reason">{venue.reason}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

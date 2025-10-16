import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ResultsView.css";
import { API_URL } from "./config";
import { colors, commonStyles } from "./styles";

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
  placeId: string;
  googleUrl: string;
};

type Gathering = {
  id: string;
  title: string;
  location: string;
  status: string;
  timeOptions: TimeOption[];
  responses: Response[];
  rsvpDeadline: string;
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
      const response = await fetch(`${API_URL}/gatherings/${gatheringId}`);
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
  }, [id]); // Re-run if ID in URL changes

  // Function to trigger AI agents
  const handleAgentTrigger = async () => {
    if (!gathering) return;

    setAgentLoading(true);

    try {
      console.log("Triggering agent for gathering:", gathering.id);

      const response = await fetch(`${API_URL}/agent-trigger/${gathering.id}`, {
        method: "POST",
      });

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
          className="btn-primary"
          style={{
            ...commonStyles.buttonPrimary,
            backgroundColor: colors.primary,
          }}
        >
          📝 Submit Response
        </button>

        <button
          onClick={() => fetchGathering(gathering.id)}
          className="btn-secondary"
          style={commonStyles.buttonSecondary}
        >
          🔄 Refresh
        </button>

        {/* Only show if we have responses but no agent output yet */}
        {gathering.responses.length > 0 && !gathering.agentOutput && (
          <button
            onClick={handleAgentTrigger}
            disabled={agentLoading}
            className="btn-success"
            style={{
              ...commonStyles.buttonPrimary,
              backgroundColor: agentLoading ? colors.border : colors.success,
              cursor: agentLoading ? "not-allowed" : "pointer",
              opacity: agentLoading ? 0.6 : 1,
            }}
          >
            {agentLoading ? "🤖 Running Agent..." : "🤖 Trigger Agent"}
          </button>
        )}
      </div>
      {/* Available Time Slots Section - NEW! */}
      <div
        style={{
          padding: "24px",
          backgroundColor: colors.white,
          borderRadius: "12px",
          marginBottom: "20px",
          border: `1px solid ${colors.border}`,
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h3 style={{ margin: 0 }}>⏰ Available Time Slots</h3>
          <div
            style={{
              backgroundColor: "#fef3c7",
              padding: "8px 16px",
              borderRadius: "8px",
              border: `2px solid ${colors.warning}`,
            }}
          >
            <span
              style={{ fontSize: "13px", color: "#92400e", fontWeight: "600" }}
            >
              ⏳ RSVP by:{" "}
              {new Date(gathering.rsvpDeadline).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
        <p
          style={{
            fontSize: "14px",
            color: colors.textLight,
            marginBottom: "15px",
            marginTop: "12px",
          }}
        >
          Choose which times work for you when submitting your response:
        </p>
        {/* Individual Time slot card */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {gathering.timeOptions.map((option, index) => (
            <div
              key={index}
              style={{
                padding: "12px 18px",
                backgroundColor: colors.background,
                border: `2px solid ${colors.border}`,
                borderRadius: "8px",
                fontSize: "14px",
                transition: "all 0.2s",
              }}
            >
              <strong style={{ color: colors.text }}>{option.label}</strong>
              <div
                style={{
                  fontSize: "12px",
                  color: colors.textLight,
                  marginTop: "4px",
                }}
              >
                {new Date(option.start).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}{" "}
                -{" "}
                {new Date(option.end).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Waiting for responses message */}
      {gathering.responses.length === 0 && (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: colors.textLight,
            backgroundColor: colors.background,
            borderRadius: "12px",
            marginBottom: "20px",
            border: `1px solid ${colors.border}`,
          }}
        >
          <h3 style={{ color: colors.text, marginTop: 0 }}>
            👥 Waiting for Responses
          </h3>
          <p style={{ color: colors.textLight, marginBottom: "12px" }}>
            Click "Submit Response" above to add responses from Bob, Charlie, or
            Alice!
          </p>
          <p style={{ marginBottom: 0 }}>
            <small style={{ color: colors.textLight }}>
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
              📅
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
                <h4>Budget</h4>
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
                  {gathering.agentOutput?.preferenceAnalysis
                    .cuisinePreferences[0] || "No preference"}
                </p>
                <small>
                  {gathering.agentOutput?.preferenceAnalysis.dietaryRestrictions.join(
                    ", "
                  ) || "No restrictions"}
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
                  <a
                    key={venue.name}
                    href={venue.googleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="venue-card"
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      display: "block",
                    }}
                  >
                    <h3 style={{ color: colors.primary }}>{venue.name}</h3>
                    <p className="venue-address">{venue.address}</p>
                    <div className="venue-stats">
                      <span>⭐ {venue.rating}</span>
                      <span>{"$".repeat(venue.priceLevel)}</span>
                    </div>
                    <p className="venue-reason">{venue.reason}</p>
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

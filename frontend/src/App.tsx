import { useState, useEffect } from "react";
import "./ResultsView.css"; // Add link to CSS file

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
    // ← Add user name into response!
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

function App() {
  const [gathering, setGathering] = useState<Gathering | null>(null);

  useEffect(() => {
    fetch(
      "http://localhost:3000/gatherings/a7430f9e-7cda-42fb-b3c1-a46eb60fe776"
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched gathering:", data);
        setGathering(data);
      })
      .catch((error) => console.error("Error fetching gathering:", error));
  }, []);

  if (!gathering) {
    return <div>Loading...</div>;
  }

  return (
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
                  gathering.agentOutput?.preferenceAnalysis.recommendedTimeSlot
                    .label
                }
              </p>
              <small>
                {
                  gathering.agentOutput?.preferenceAnalysis.recommendedTimeSlot
                    .availableCount
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
                {gathering.agentOutput?.preferenceAnalysis.budgetRange.currency}
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
  );
}

export default App;

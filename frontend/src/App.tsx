import { useState, useEffect } from 'react'

type TimeOption = {
  start: string
  end: string
  label: string
}

type Response = {
  id: string
  userId: string
  availableTimeSlotIndices: number[]
  budgetMax: number
  cuisinePreferences: string[]
  dietaryRestrictions: string | null
}

type PreferenceAnalysis = {
  recommendedTimeSlot: {
    index: number
    label: string
    availableCount: number
  }
  budgetRange: {
    min: number
    max: number
    currency: string
  }
  cuisinePreferences: string[]
  dietaryRestrictions: string[]
  summary: string
}

type VenueRecommendation = {
  name: string
  address: string
  rating: number
  priceLevel: number
  cuisine: string
  reason: string
}

type Gathering = {
  id: string
  title: string
  location: string
  status: string
  timeOptions: TimeOption[]
  responses: Response[]
  agentOutput: {
    preferenceAnalysis: PreferenceAnalysis
    venueRecommendation: {
      recommendations: VenueRecommendation[]
      recommendation: string
      searchedAt: string
      location: string
    }
  } | null
}

function App() {
  const [gathering, setGathering] = useState<Gathering | null>(null)

  useEffect(() => {
    fetch('http://localhost:3000/gatherings/a7430f9e-7cda-42fb-b3c1-a46eb60fe776')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched gathering:', data)
        setGathering(data)
      })
      .catch(error => console.error('Error fetching gathering:', error))
  }, [])

  if (!gathering) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>{gathering.title}</h1>
      <p>{gathering.location}</p>
      <p>Status: {gathering.status}</p>
        <h2>Group Preferences Analysis</h2>

      {gathering.agentOutput?.preferenceAnalysis && (
        <div style={{ border: '2px solid #4CAF50', padding: '20px', margin: 
      '10px', backgroundColor: '#f9f9f9' }}>
          <h3>Availability</h3>

      <p>{gathering.agentOutput.preferenceAnalysis.recommendedTimeSlot.label} is
      the optimal time slot as it accommodates {gathering.agentOutput.preferenceAnalysis.recommendedTimeSlot.availableCount} participants.</p>

          <h3>Budget Range</h3>
          <p>${gathering.agentOutput.preferenceAnalysis.budgetRange.min}-${gathering.agentOutput.preferenceAnalysis.budgetRange.max}
      {gathering.agentOutput.preferenceAnalysis.budgetRange.currency}</p>

          <h3>Cuisines</h3>

      <p>{gathering.agentOutput.preferenceAnalysis.cuisinePreferences.join(', ')}</p>

          <h3>Dietary Restrictions</h3>

      <p>{gathering.agentOutput.preferenceAnalysis.dietaryRestrictions.join(', ')}</p>

          <h3>Summary</h3>
          <p>{gathering.agentOutput.preferenceAnalysis.summary}</p>
        </div>
      )}

      <h2>Venue Recommendations</h2>
      {gathering.agentOutput?.venueRecommendation.recommendations.map((venue) =>
        (
              <div key={venue.name} style={{ border: '1px solid #ccc', padding: 
      '20px', margin: '10px' }}>
                <h3>{venue.name}</h3>
                <p>{venue.address}</p>
                <p>Rating: {venue.rating} ⭐</p>
                <p>Price: {'$'.repeat(venue.priceLevel)}</p>
                <p>Cuisine: {venue.cuisine}</p>
                <p><em>{venue.reason}</em></p>
              </div>
            ))}
          </div>
        )
      }

  export default App
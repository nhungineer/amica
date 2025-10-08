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
      preferenceAnalysis:
  PreferenceAnalysis
      venueRecommendation: {
        recommendations:
  VenueRecommendation[]
        recommendation: string
        searchedAt: string
        location: string
      }
    } | null
  }

  function App() {
    // State: stores the gathering data
    const [gathering, setGathering] = useState<Gathering | null>(null)

    // Effect: runs when component loads
    useEffect(() => {
      // Fetch gathering from your backend
      fetch('http://localhost:3000/gatherings/a7430f9e-7cda-42fb-b3c1-a46eb60fe776')
        .then(response => response.json())
        .then(data => {
          console.log('Fetched gathering:', data)
          setGathering(data)
        })
        .catch(error => console.error('Error fetching gathering:', error))
    }, [])  // Empty array = run once when component loads

    // Show loading while fetching
    if (!gathering) {
      return <div>Loading...</div>
    }

    // Show the data!
    return (
      <div>
        <h1>{gathering.title}</h1>
        <p>{gathering.location}</p>
        <p>Status: {gathering.status}</p>
      </div>
    )
  }

  export default App
from dotenv import load_dotenv
load_dotenv()

import os
import requests
from crewai import Crew

from tasks import MeetingPreparationTasks
from agents import MeetupCoordinationAgents

tasks = MeetingPreparationTasks()
agents = MeetupCoordinationAgents()

print("## Welcome to the Meetup Coordination Crew")
print('-------------------------------')
print("📋 The system will analyze your group's poll responses and find suitable venues!")
print()
location = input("What location/area should we search for venues? (e.g., 'Brunswick, VIC, Australia')\n")

print("\n🔍 Searching for venues...")

# Make direct Google Places API call
def search_venues_direct(query, location, radius=5000):
    try:
        api_key = os.environ.get("GOOGLE_PLACES_API_KEY")
        if not api_key:
            return "Error: Google Places API key not found"

        # Geocode location
        geocode_url = "https://maps.googleapis.com/maps/api/geocode/json"
        geocode_params = {"address": location, "key": api_key}
        geocode_response = requests.get(geocode_url, params=geocode_params)
        geocode_data = geocode_response.json()

        if not geocode_data.get("results"):
            return f"Error: Could not find location '{location}'"

        # Get coordinates
        location_data = geocode_data["results"][0]["geometry"]["location"]
        lat, lng = location_data["lat"], location_data["lng"]

        # Search for places
        places_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        places_params = {
            "location": f"{lat},{lng}",
            "radius": radius,
            "keyword": query,
            "type": "restaurant" if "restaurant" in query.lower() else "establishment",
            "key": api_key
        }

        places_response = requests.get(places_url, params=places_params)
        places_data = places_response.json()

        if places_data.get("status") != "OK":
            return f"Error: {places_data.get('status', 'Unknown error')}"

        # Format results
        result_text = f"Real venue data from Google Places API for '{query}' near '{location}':\n\n"

        for i, place in enumerate(places_data.get("results", [])[:5], 1):
            name = place.get("name", "Unknown")
            address = place.get("vicinity", "Address not available")
            rating = place.get("rating", "No rating")
            price_level = "💰" * place.get("price_level", 0) if place.get("price_level") else "Price not available"
            types = ", ".join(place.get("types", []))

            result_text += f"{i}. **{name}**\n"
            result_text += f"   - Address: {address}\n"
            result_text += f"   - Rating: {rating}\n"
            result_text += f"   - Price Level: {price_level}\n"
            result_text += f"   - Types: {types}\n\n"

        return result_text

    except Exception as e:
        return f"Error searching venues: {str(e)}"

# Generate simulated poll data
def generate_poll_data(group_size):
    """Generate simulated poll responses for group availability and preferences"""
    import random

    # Sample names for realism
    names = ["Alex", "Jordan", "Casey", "Morgan", "Taylor", "Riley", "Avery", "Quinn"]
    selected_names = names[:int(group_size)]

    # Sample data
    availabilities = [
        ["Friday 7pm", "Saturday 6pm"],
        ["Friday 8pm", "Sunday 7pm"],
        ["Saturday 6pm", "Sunday 7pm"],
        ["Friday 7pm", "Sunday 6pm"],
        ["Saturday 7pm", "Sunday 8pm"]
    ]

    cuisines = ["Italian", "Asian", "Mexican", "No preference", "Mediterranean", "American"]
    budgets = ["$20", "$25", "$30", "$35", "$40"]

    poll_results = f"Poll Results from {group_size} people:\n\n"

    for i, name in enumerate(selected_names):
        availability = availabilities[i % len(availabilities)]
        cuisine = cuisines[i % len(cuisines)]
        budget = budgets[i % len(budgets)]

        poll_results += f"👤 {name}:\n"
        poll_results += f"   - Available: {', '.join(availability)}\n"
        poll_results += f"   - Cuisine preference: {cuisine}\n"
        poll_results += f"   - Budget: {budget} per person\n\n"

    return poll_results

# Generate simulated poll data for a group of 5 people
group_size = 5
poll_data = generate_poll_data(group_size)
print(f"✅ Generated simulated poll responses for {group_size} people!")

# Extract preferences from poll data for venue search (we'll use "restaurant" as default)
preferences = "restaurant"  # The preference agent will determine specific cuisine
venue_data = search_venues_direct(preferences, location)
print("✅ Found real venue data from Google Places API!")

# Create Agents
venue_researcher = agents.venue_research_agent()
preference_analyst = agents.group_preference_agent()

# Create Tasks
preference_analysis = tasks.group_preference_analysis_task(preference_analyst, poll_data)
venue_research = tasks.venue_research_task(venue_researcher, group_size, preferences, location, venue_data)

# Set task dependencies (preference analysis happens first)
venue_research.context = [preference_analysis]

# Create Crew with both agents
crew = Crew(
    agents=[preference_analyst, venue_researcher],
    tasks=[preference_analysis, venue_research]
)

result = crew.kickoff()

# Print results
print("\n\n################################################")
print("## Here are the venue recommendations")
print("################################################\n")
print(result)

from textwrap import dedent
from crewai import Agent

from tools.ExaSearchTool import ExaSearchTool
from tools.GooglePlacesTool import GooglePlacesTool

class MeetupCoordinationAgents():
    def venue_research_agent(self):
        return Agent(
            role='Venue Research Specialist',
            goal='Analyze and recommend venues for casual meetups based on real API data',
            # tools=GooglePlacesTool.tools(),  # Disabled due to compatibility issues
            backstory=dedent("""\
                As a Venue Research Specialist, you excel at analyzing real venue data
                from Google Places API and providing thoughtful recommendations for casual
                meetups. You consider factors like group size, ratings, price levels,
                location convenience, and venue types to make the best recommendations."""),
            verbose=True
        )

    def group_preference_agent(self):
        return Agent(
            role='Group Preference Analyst',
            goal='Analyze poll responses to identify group consensus on timing, budget, and preferences',
            # No tools needed - processes provided poll data
            backstory=dedent("""\
                As a Group Preference Analyst, you excel at processing poll responses
                and finding consensus among group members. You identify common availability
                windows, budget ranges that work for everyone, and cuisine preferences
                that can accommodate the group. You're skilled at resolving conflicts
                and finding compromises that satisfy the majority."""),
            verbose=True
        )

    def meeting_strategy_agent(self):
        return Agent(
            role='Meeting Strategy Advisor',
            goal='Develop talking points, questions, and strategic angles for the meeting',
            #tools=ExaSearchTool.tools(),
            backstory=dedent("""\
                As a Strategy Advisor, your expertise will guide the development of
                talking points, insightful questions, and strategic angles
                to ensure the meeting's objectives are achieved."""),
            verbose=True
        )

    def summary_and_briefing_agent(self):
        return Agent(
            role='Briefing Coordinator',
            goal='Compile all gathered information into a concise, informative briefing document',
            #tools=ExaSearchTool.tools(),
            backstory=dedent("""\
                As the Briefing Coordinator, your role is to consolidate the research,
                analysis, and strategic insights."""),
            verbose=True
        )

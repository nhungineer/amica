from textwrap import dedent
from crewai import Task

class MeetingPreparationTasks():
	def venue_research_task(self, agent, group_size, preferences, location, venue_data):
		return Task(
			description=dedent(f"""\
				Use the group preference analysis and real venue data from Google Places API
				to provide the best venue recommendations for this meetup. Consider the
				group's availability consensus, budget constraints, and cuisine preferences
				identified in the preference analysis.

				Group Size: {group_size}
				Initial Search: {preferences}
				Location: {location}

				Real Venue Data from Google Places API:
				{venue_data}

				Important: Review the preference analysis results from the previous task
				to understand the group's consensus on timing, budget, and cuisine.
				Use this analysis to filter and recommend venues that match the group's
				collective preferences."""),
			expected_output=dedent("""\
				Final venue recommendations that incorporate both the group preference
				analysis and real venue data, including:
				- Top 3 recommended venues with full details
				- How each venue aligns with the group's consensus preferences
				- Recommended timing based on group availability
				- Budget compatibility confirmation
				- Complete meetup plan ready for execution"""),
			async_execution=True,
			agent=agent
		)

	def group_preference_analysis_task(self, agent, poll_data):
		return Task(
			description=dedent(f"""\
				Analyze the poll responses to identify group consensus and preferences
				for the meetup. Look for patterns in availability, budget constraints,
				and cuisine preferences. Identify the optimal timing and constraints
				that work for the majority of the group.

				Poll Data:
				{poll_data}

				Please analyze this data to find:
				1. Common availability windows that work for most people
				2. Budget range that accommodates the group
				3. Cuisine preferences and any conflicts to resolve
				4. Recommendations for optimal meetup timing and constraints"""),
			expected_output=dedent("""\
				A comprehensive analysis of group preferences including:
				- Recommended time slots with participant availability
				- Agreed budget range for the group
				- Cuisine preference consensus or compromise suggestions
				- Any conflicts identified and proposed resolutions"""),
			async_execution=False,
			agent=agent
		)

	def meeting_strategy_task(self, agent, context, objective):
		return Task(
			description=dedent(f"""\
				Develop strategic talking points, questions, and discussion angles
				for the meeting based on the research and industry analysis conducted

				Meeting Context: {context}
				Meeting Objective: {objective}"""),
			expected_output=dedent("""\
				Complete report with a list of key talking points, strategic questions
				to ask to help achieve the meetings objective during the meeting."""),
			agent=agent
		)

	def summary_and_briefing_task(self, agent, context, objective):
		return Task(
			description=dedent(f"""\
				Compile all the research findings, industry analysis, and strategic
				talking points into a concise, comprehensive briefing document for
				the meeting.
				Ensure the briefing is easy to digest and equips the meeting
				participants with all necessary information and strategies.

				Meeting Context: {context}
				Meeting Objective: {objective}"""),
			expected_output=dedent("""\
				A well-structured briefing document that includes sections for
				participant bios, industry overview, talking points, and
				strategic recommendations."""),
			agent=agent
		)

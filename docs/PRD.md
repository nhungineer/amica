**1. Product Summary**

Amica is a standalone agent application that helps organise casual meetups (such as coffee, dinner, or other gatherings) between friends, colleagues, or family by coordinating a simple workflow.

### Target users & core problems solved:
- Busy people who want an easy way to socialise with friends and family
- Problem solved:
    - Coordinating people’s availability and preferences for meetup is time-consuming and painful, multi-step process
    - People want to meet up but can’t be bothered managing all the preferences, doing the research, managing the communication - so this will be social gathering made easy
- Key differentiation (AI agent vs manual coordination)
    - This is perfect for AI agent because coordination requires sophisticated balancing preferences and decision making, with multistep that common non-AI tool can have troubles with
    - FE tool can do polling but can’t balance preferences and make decisions or generate follow up response or manage communications but LLM can

**2. User Stories & Jobs-to-be-Done**

- I want to create a meetup page to keep all the information about the meetup in one thread
- I want to share the link to my friends to add their preferences and availability
- I want to a deadline for RSVP for closing the poll or a trigger for when everyone in the group have RSVP’d for AI to analyse preferences and come up with recommendations
- I want the app to send reminder in the group for people who have not answered the poll to d complete it, so I don’t have to
- I want the AI to research venue based on provided preferences and availability
- I want the app to allow people to change responses and the app to update based on the new information
- I want the agents to escalate to human’s review and decision for the meetup and if they run into problems coordinating
- I want the app to remember user preferences and latest updates across sessions.

**3. User flow**

Organiser journey

1. Landing page: "Create meetup" [No login button visible]
2. Fill out: location, time options, friend emails
3. Preview: "Here's what your friends will see"
4. **Auth gate**: "Sign in to send invites" 
5. Send: Email invites with meetup link
6. Dashboard: Track responses, see agent recommendations

Friends journey

1. Receives email: "Sarah wants to organise dinner" + link
2. Clicks link → Meetup response page → login
3. Fills preferences: availability, cuisine, budget
4. Submits → "Thanks! We'll let you know when everyone responds"
5. Later: Gets email with agent's restaurant recommendations


**Agent Workflow & Decision Logic**

- Step-by-step orchestration (poll → research → recommend)
- Poll threshold reached: all invitees responded OR RSVP deadline reached & threshold of participants reached → Group preference agent to analyse preferences and handover output for venue research agent to continue as filter for venue search
    - location
    - availability (against opening hours)
    - must-have criteria
    - nice to have criteria
- Venue search agent queries Google Places API based on info provided by group analysis preferences
    - provide top 3 options that best match the queries
    - provide recommendation and clear explanation/recomendation reason
    - use self-reflect mode to evaluate the response before providing it to end user
    - output needs to be structured for UI display

**4. Technical Architecture**

- APIs & integrations (venue search, authentication, notifications)
    - API integration:
        - Venue search using Google Places API
        - OpenAI for agent recommendations and logic
- Database schema (user profiles, event context, venue cache)
    - User profile
    - Event context
    - Venue

Agent capabilities:
- tool calling, 
- memory, 
- agent handoff/orchestration

## Context
- I originally modified a CrewAI template to prep for meeting into a meetup organiser with claude code, using Google Places API for venue search, OpenAI for AI API, and got the BE working in a local file

- I went to Replit agent to build the FE on top of crewAI and realised 2 things: (1) The experience need a lot of rethinking for it to be useful such as async state management, user authorisation, schema updates, notifications and (2) Replit agent autonomous way of working is no longer suitable for my learning so I want to use Claude Code to rebuild this and learn more about full stack engineering, as well as agent work

## Learning objectives
- I want to understand full-stack development with the help of Claude Code and learn CLI in a practical agent project
- I want to understand async state management patterns for multi-user coordination"
- Teach me git fundamentals (init, commit, branches, worktrees) as we build"
- Note: I have zero coding knowledge nor git experience (I registered for a github account)
- Explain architectural decisions before implementing - I learn best with the 'why' not just the 'how'
- I would like Claude Code to explain the directions and let me ask questions, read through the code before proceeding. It's less about autonomous coding but more mentoring and pair programming, treating me as a beginer dev who wants to learn



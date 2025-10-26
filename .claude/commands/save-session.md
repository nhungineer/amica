Save the current Claude Code conversation to ~/Documents/learning/claude-code-sessions/.

Instructions:

1. Get the current timestamp in format: YYYY-MM-DD-HHMM
2. Use the topic provided by the user (arguments after /save-session)
3. Create filename: {timestamp}-{topic-slugified}.txt
4. Save the ENTIRE conversation (all messages from start to current) to that file
5. Confirm to the user where the file was saved

Topic for this session: {{$ARGS}}

If no topic provided, use "general-session" as the topic.

Format: Plain text with clear message separators.

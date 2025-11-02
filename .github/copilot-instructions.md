# Development Workflow Instructions

## Phase 1: Backend & Agent Actions
Build and validate all backend operations before frontend development.

### Step 1: Define Agent Actions
- Create all executable actions the AI agent will perform
- Document each action's inputs, outputs, and error handling

### Step 2: Manual Testing
- Test each action independently with sample data
- Verify expected behavior and edge cases

### Step 3: AI Agent Integration Testing
- Test if the AI agent can correctly invoke each action
- Validate prompt-based execution works as intended

### Step 4: Frontend Implementation
- Only after backend validation is complete
- Build UI components to expose tested actions

## Priority
Backend stability and agent capability → Frontend implementation

## Tools
-- Tools and Frameworks to use are listed in the project root agents.md file.



# Keep in mind these things:
- Every feature or action we create, it shall be later be exposed to the AI agent through prompts. Therefore, thorough testing of each action's integration with the AI agent is crucial before moving on to frontend development.
- The response from AI Agent should be in proper JSON and that JSON should be parseable by the system in frontend.
- Ensure that all backend actions are robust and handle errors gracefully, as this will directly impact the user experience on the frontend.
- Ask questions if any part of the instructions or requirements are unclear and ambiguous whenever wherever neccessary, and then for sure store them in the knowledgebase for future reference.
- Update the knowledgebase with new learnings, decisions, and clarifications as the project progresses.

# Before implementing the Agent, AI or anything related to it, Remind me with the phrase "You asked me to remind about AI whether we shall provide the LLM the knowledge about the actions, tool calls for the actions so that it can respond properly".


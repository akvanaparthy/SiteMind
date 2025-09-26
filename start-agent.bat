@echo off
echo Starting AI Agent Service on port 3001...
cd api-agent
set AGENT_PORT=3001
set AGENT_URL=http://localhost:3001
set PORT=3001
npm run dev

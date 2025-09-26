i want to build an ai agent,
voice based or text based web agent assistant - can edit or create post, open close tickets, send marketing emails, make website under maintenance or live. clear cache, check if any tickets, and readout if prompted, and etc.. every action going on the website, the agent must know it

voice can be implemented later, first we can go with text based
An AI agent that:

- Accepts voice or text commands (e.g., “Create a blog post about AI trends”, “Close ticket #45”, “Send a marketing email to all users”)
- Knows the current state of your website: live/maintenance, open tickets, cache status, recent activity
- Can perform real actions across integrated platforms
- Can read out updates (TTS) when prompted: “What’s new today?”
- Maintains memory/log of all actions taken

Think: "Your website’s personal ops manager powered by AI."

Tech stack we going to use:
Agent framework: LangChain, LangGraph using typescript preferred
LLM: Local hosted through LMStudio (maybe Llama-3.2-8X3B-MOE-Dark-Champion-Instruct-uncensored-abliterated-18.4B), OpenAI like API
Voice I/O: Web Speech API (frontend), or Whisper (STT), ElevenLabs (TTS) (In later features)
Frontend: React.js on Next.js + Websockets, Typescript (Javascript)
VectorDB: Pinecone
Tools / APIs (In later features, now we will leave scope): GitHub API, Zendesk/Jira API, SendGrid/Mailgun, Netlify/Vercel API, Redis (cache), custom webhook logs
Monitoring Layer: Polling + Webhooks + Event Log DB (PostgreSQL)

This is a small project for my resume, so we dont need to code it as precise as for a production grade, we can build the system so simple that the agent can perform all the tasks.

So fot this, we are going to build a simple ecommerce website which also happens to have a blog
functions and features which the agent can be able to do:

1. Change status of particular order with order id (Delivered, Refunded, Pending by making according calls such as intiiate refund will call refund api to payment gateway and changes the status but as we are not going to integrate paymentgateway, make a mock action to call api for razorpay or stripe and print it in temrinal)
2. Create, edit, draft a blog post as well as publish, draft, trash it
3. Write content if asked in the blog post along with creating the post
4. Manage support tickets such as create, close, open status with ticket id
5. Answer all the queries related to the website, database and every status, the agent shall have real time awareness of the website

One important thing not to forget is, whatever, literally whatever the agent does or tries to do even succeeds or fails a task or operation, it shall be logged in dashboard, give any url in the admin dashboard where the admin can check what the agent is doing or did. The logging must be like a sorted form, a task will be logged, and further sub tasks are shocased expanding this main task and so on

Demo Scenarios
"What's the status of order #123?"
Agent queries database, returns order details
"Create a blog post about AI trends in 2024"
Agent generates content, creates draft, asks for approval
"Refund order #456 due to defective product"
Agent mocks payment gateway call, updates order status, logs action
"How many open tickets do we have?"
Agent queries ticket database, provides summary
"Put the website in maintenance mode"
Agent updates website status, notifies about the change

Use the most creative llm model you have to create front end, so that it can make visually so best than anything out there on internet, so interactive, so beautiful that it shall showcase your actual skills

Use the best thinking llm model you have to create backend, check for possible logical errors or actions or user flows and implement it accordingly

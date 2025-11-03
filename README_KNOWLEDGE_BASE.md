# 📚 SiteMind Knowledge Base - Quick Reference

**Last Updated:** November 2, 2025

---

## 🗂️ DOCUMENT HIERARCHY

```
📄 PROJECT_VISION.md          ← The "WHAT" and "WHY" (north star)
📋 IMPLEMENTATION_CHECKLIST.md ← The "HOW" (step-by-step tasks)
🎯 ACTION_PLAN.md              ← The "NOW" (current priorities)
📊 TESTING_RESULTS.md          ← The "STATUS" (what works/doesn't) [TO BE CREATED]
🐛 TESTING_ISSUES.md           ← The "PROBLEMS" (known issues) [TO BE CREATED]
```

---

## 🎯 PROJECT AT A GLANCE

**What:** AI-native e-commerce platform with autonomous AI agent  
**Tech Stack:** Next.js, PostgreSQL, LangChain, LMStudio (Qwen Coder 32B)  
**Current Phase:** 1 - Backend & Agent (85% complete)  
**Current Focus:** Testing all 21 tools to achieve 90%+ success rate  
**Next Phase:** Admin Dashboard Frontend (not started)

---

## 🔑 KEY DECISIONS MADE

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Primary Agent** | LMStudio FC (lmstudio-fc) | Local, cost-free, 85%+ success rate |
| **LLM Model** | Qwen Coder 32B | Optimized for code/structured tasks |
| **Frontend Priority** | Backend first, UI later | Ensure agent works perfectly before building UI |
| **Approval UI** | Inline in chat (not modal) | Faster workflow, less context switching |
| **Conversation History** | In-memory only | Simplicity first, persistence later |
| **Integrations** | Mock (payment, email) | Focus on core functionality first |
| **Testing Strategy** | Manual (automated later) | Speed over perfection at this stage |
| **Deployment** | Vercel + Supabase | Complete locally first, cloud later |

---

## 🚀 HOW TO START WORKING

### If you're returning after a break:
1. **Read** `PROJECT_VISION.md` (5 min) - Remember the goal
2. **Skim** `IMPLEMENTATION_CHECKLIST.md` (3 min) - See current status
3. **Read** `ACTION_PLAN.md` "TODAY'S TASKS" (2 min) - Know what to do
4. **Start coding!**

### If you're starting fresh:
1. **Read** `PROJECT_VISION.md` (10 min) - Understand the vision
2. **Read** `IMPLEMENTATION_CHECKLIST.md` Phase 0 + Phase 1 (15 min)
3. **Read** `ACTION_PLAN.md` (10 min)
4. **Set up environment** (see checklist Phase 0)
5. **Start coding!**

---

## 🔥 CURRENT PRIORITIES (This Week)

1. ✅ Knowledge base created (you're reading it!)
2. 🔄 Create comprehensive test script
3. 🔄 Test all 21 tools with LMStudio FC agent
4. 🔄 Fix issues to reach 90%+ success rate
5. 🔄 Document results and update checklist

---

## 📊 CURRENT STATUS

### What's Working ✅
- PostgreSQL database (9 models, seed data)
- Next.js API routes (all CRUD operations)
- 21 LangChain tools (all implemented)
- LMStudio FC agent (implemented)
- WebSocket server (real-time communication)

### What's Not Tested 🧪
- Agent execution of all 21 tools
- JSON response format validation
- Approval workflow end-to-end
- Multi-step commands
- Error handling robustness

### What's Not Started ❌
- Frontend (admin dashboard)
- Public storefront
- Automated tests
- Cloud deployment

---

## 🎓 LEARNING OBJECTIVES

This is a **personal learning/portfolio project** with **production-grade standards**:

**Skills Being Learned:**
- AI agent orchestration (LangChain, LLMs)
- Full-stack TypeScript development
- Real-time WebSocket communication
- PostgreSQL + Prisma ORM
- Modern React/Next.js patterns
- System architecture & design

**Portfolio Value:**
- Working AI agent (not just chatbot)
- Real-time features
- Clean, maintainable code
- Comprehensive documentation
- Production-ready patterns

---

## 🛠️ QUICK COMMANDS

```bash
# Start everything
docker-compose up -d              # PostgreSQL
npm run dev                       # Next.js (:3000)
cd api-agent && npm run dev       # Agent service (:3001)

# Database
npm run db:studio                 # Prisma Studio (GUI)
npm run db:seed                   # Reseed data
npx prisma migrate dev            # Create migration

# Testing
cd api-agent
npm run test:tools                # Test individual tools
npm run test:lmstudio-fc          # Test LMStudio FC agent
tsx src/tests/[test-file].ts      # Run specific test

# Logs
# Agent logs: Terminal running agent service
# Next.js logs: Terminal running npm run dev
# Database: Prisma Studio
```

---

## 🚨 WHEN THINGS BREAK

### Agent not responding?
1. Check LMStudio: `curl http://localhost:1234/v1/models`
2. Check agent service: Terminal should show "Agent Service is ready"
3. Check WebSocket: Terminal should show "WebSocket server started"

### Database errors?
1. Check Docker: `docker ps` (should see postgres container)
2. Check connection: `npm run db:studio` (should open browser)
3. Reset if needed: `npx prisma migrate reset`

### Tool execution failed?
1. Check Next.js API is running (:3000)
2. Check API route exists and works (test with Thunder Client)
3. Check tool schema matches API expectations
4. Check agent logs for detailed error

---

## 📝 REMEMBER THESE RULES

### Development Workflow (copilot-instructions.md)
1. **Backend first** - Always validate backend before frontend
2. **Manual testing** - Test each action independently
3. **AI agent testing** - Verify agent can invoke actions
4. **Frontend last** - Only after backend is stable

### Code Quality
- ✅ TypeScript strict mode (minimize `any`)
- ✅ Error handling everywhere (try/catch)
- ✅ Logging at key points
- ✅ JSDoc comments on all functions

### AI Agent Reminder
Before changing agent behavior, review:
- `lib/system-prompt.ts` (agent behavior)
- `lib/agent-schemas.ts` (response validation)
- Tool schemas in `api-agent/src/tools/` (input validation)

---

## 🎯 SUCCESS = DONE WHEN...

### Phase 1 (Current)
- [ ] 90%+ tool success rate
- [ ] 100% valid JSON responses
- [ ] Approval workflow tested
- [ ] All issues documented
- [ ] Knowledge base updated

### Phase 2 (Next)
- [ ] Admin dashboard UI complete
- [ ] Agent console working
- [ ] Real-time logs working
- [ ] All pages responsive
- [ ] Animations polished

### Phase 3 (Future)
- [ ] Public storefront complete
- [ ] Shopping cart working
- [ ] Checkout flow complete
- [ ] Blog pages working

### Final
- [ ] Deployed to Vercel
- [ ] Database on Supabase
- [ ] Demo video recorded
- [ ] Portfolio page created
- [ ] GitHub README polished

---

## 🔗 USEFUL LINKS

**Local Development:**
- Next.js: http://localhost:3000
- Agent Service: http://localhost:3001
- LMStudio: http://localhost:1234
- Prisma Studio: http://localhost:5555

**Documentation:**
- Project docs: `docs/` folder
- API docs: `agents.md`
- Copilot rules: `.github/copilot-instructions.md`

**External:**
- LangChain: https://js.langchain.com/docs
- Prisma: https://www.prisma.io/docs
- Next.js: https://nextjs.org/docs
- Tailwind: https://tailwindcss.com/docs

---

## 💬 QUICK ANSWERS

**Q: Can I start frontend now?**  
A: No - finish Phase 1 testing first (90%+ success rate)

**Q: Should I fix Gemini agent?**  
A: No - paused due to rate limits, not a priority

**Q: Should I add feature X?**  
A: Not until Phase 1 is 100% complete

**Q: How do I test a tool?**  
A: See `ACTION_PLAN.md` Priority 2 (test commands)

**Q: Where do I report bugs?**  
A: Create `TESTING_ISSUES.md` and document there

**Q: How do I update knowledge base?**  
A: Edit the 3 main MD files after major progress

**Q: I'm stuck, what do I do?**  
A: 1) Check terminal logs, 2) Check Prisma Studio, 3) Re-read `ACTION_PLAN.md`

---

**Created:** November 2, 2025  
**Purpose:** Single source of truth for project context  
**Audience:** You (and future you)  
**Update Frequency:** After major milestones or when things change

**Next Update:** After completing test script creation

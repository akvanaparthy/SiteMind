# SiteMind - AI-Native E-Commerce Platform

A full-stack e-commerce platform where **every operation is monitored and executable by an AI agent**. Built with Next.js, TypeScript, Prisma, and LangChain.

## 🚀 Features

### Core Platform

- **AI-First Architecture**: Every operation is monitored and executable by an AI agent
- **Real-Time Monitoring**: Watch your AI agent work, audit decisions, and intervene when needed
- **Modern Admin Dashboard**: WordPress-like interface with glassmorphism design
- **Comprehensive Logging**: Every AI action is logged with detailed audit trails

### Admin Dashboard

- **Dashboard Home**: Overview with stats, recent activity, and agent status
- **Order Management**: Process orders, handle refunds, update statuses
- **Blog Management**: Create, edit, and publish blog posts with AI assistance
- **Support Tickets**: Manage customer support with AI-powered responses
- **AI Agent Console**: Real-time chat interface with your AI agent
- **Agent Logs**: Expandable timeline of all AI actions and decisions

### AI Agent Capabilities

- **Order Processing**: Refund orders, update statuses, process payments
- **Content Creation**: Generate blog posts, product descriptions, emails
- **Support Management**: Close tickets, respond to customers, escalate issues
- **Site Management**: Toggle maintenance mode, clear cache, generate reports
- **Data Analysis**: Query database, generate insights, create reports

## 🛠 Tech Stack

### Frontend

- **Next.js 14** (App Router)
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **Recharts** for data visualization

### Backend

- **Next.js API Routes**
- **Prisma ORM** with PostgreSQL
- **WebSocket** for real-time communication
- **LangChain** for AI agent functionality

### AI Agent Service

- **LangChain + LangGraph** (TypeScript)
- **OpenAI API** (compatible with local LLMs via LMStudio)
- **Pinecone** for vector memory
- **WebSocket Server** for real-time communication

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin dashboard pages
│   │   │   ├── dashboard/     # Dashboard home
│   │   │   ├── orders/        # Order management
│   │   │   ├── posts/         # Blog management
│   │   │   ├── tickets/       # Support tickets
│   │   │   ├── settings/      # Site settings
│   │   │   └── agent/         # AI agent console & logs
│   │   ├── api/               # API endpoints
│   │   └── page.tsx           # Public homepage
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   └── admin/             # Admin-specific components
│   └── lib/                   # Utilities and configurations
├── api-agent/                 # AI Agent Service
│   ├── src/
│   │   ├── agents/            # LangChain agents
│   │   ├── tools/             # Agent tools (orders, blog, etc.)
│   │   └── lib/               # Agent utilities
│   └── package.json
├── prisma/
│   └── schema.prisma          # Database schema
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Local LLM setup (LMStudio recommended) or OpenAI API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd sitemind
   ```

2. **Quick Setup (Recommended)**

   **🎯 One-Command Setup:**

   ```bash
   npm run setup
   ```

   **📋 Interactive Setup:**

   ```bash
   npm run setup-env    # Create .env file
   npm run setup-db     # Setup database
   ```

   **🖥️ Platform-Specific Scripts:**

   For Windows:

   ```bash
   setup-local.bat
   ```

   For Linux/Mac:

   ```bash
   chmod +x setup-local.sh
   ./setup-local.sh
   ```

   **🔧 Manual Setup:**

   ```bash
   npm install --legacy-peer-deps
   cd api-agent && npm install --legacy-peer-deps && cd ..
   ```

3. **Configure the application**

   **Option A: Use config.json (Recommended)**

   ```bash
   # Edit config.json to match your setup
   # All settings are centralized and documented
   ```

   **Option B: Use environment variables**

   ```bash
   cp env.example .env
   # Edit .env to override config.json settings
   ```

   **Key Configuration Settings:**

   ```json
   {
     "llm": {
       "model": {
         "name": "your-model-name-here"
       },
       "lmstudio": {
         "baseUrl": "http://localhost:1234"
       }
     },
     "database": {
       "url": "postgresql://username:password@localhost:5432/sitemind"
     }
   }
   ```

   📖 **See [CONFIG.md](CONFIG.md) for complete configuration guide**
   📖 **See [SETUP-GUIDE.md](SETUP-GUIDE.md) for detailed setup instructions**
   🆘 **See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues and solutions**

4. **Set up LMStudio (Local LLM)**

   - Download and install [LMStudio](https://lmstudio.ai/)
   - Start the local server (default port: 1234)
   - **Configure your model** in `config.json`:
     ```json
     {
       "llm": {
         "model": {
           "name": "your-model-name-here"
         },
         "lmstudio": {
           "baseUrl": "http://localhost:1234",
           "autoLoad": true
         }
       }
     }
     ```
   - **Auto-loading**: The system will automatically load your specified model
   - **Multiple models support**: Targets your specific model even with multiple models running

5. **Set up the database**

   ```bash
   npx prisma db push
   npx prisma generate
   ```

6. **Start the development servers**

   Main application:

```bash
npm run dev
```

AI Agent service (in a separate terminal):

```bash
cd api-agent
npm run dev
```

**Test LMStudio Integration** (optional):

```bash
cd api-agent
npm run test-lmstudio
```

### Access the Application

- **Public Site**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin/dashboard
- **AI Agent Service**: http://localhost:3001

## 🤖 AI Agent Usage

### Available Commands

#### Order Management

- `"Refund order #123"`
- `"Update order #456 status to delivered"`
- `"List all pending orders"`

#### Blog Management

- `"Create blog post about AI trends"`
- `"List all published posts"`

#### Support Tickets

- `"Close ticket #789"`
- `"List all open tickets"`

#### Site Management

- `"Enable maintenance mode"`
- `"Clear site cache"`

### Agent Console

Access the AI Agent Console at `/admin/agent/console` to:

- Chat with your AI agent in real-time
- Send natural language commands
- Monitor agent responses and actions
- View detailed execution logs

## 🎨 Design System

### Colors

- **Primary**: Indigo (600)
- **Secondary**: Purple (600)
- **Success**: Emerald (500)
- **Warning**: Yellow (500)
- **Danger**: Rose (500)
- **Neutral**: Slate (900, 600, 400)

### Components

- **Glassmorphism cards** with subtle shadows
- **Micro-interactions** with hover effects
- **Smooth animations** using Framer Motion
- **Responsive design** mobile-first approach

## 📊 Database Schema

The platform uses PostgreSQL with the following main entities:

- **Users**: Customers, admins, and AI agents
- **Orders**: E-commerce orders with status tracking
- **Posts**: Blog posts with draft/published states
- **Tickets**: Support tickets with priority levels
- **Products**: E-commerce product catalog
- **AgentLogs**: Detailed AI action logging
- **SiteConfig**: Site-wide configuration

## 🔧 Development

### Adding New AI Tools

1. Create a new tool class in `api-agent/src/tools/`
2. Implement the required methods
3. Add the tool to the main agent in `api-agent/src/agents/main-agent.ts`
4. Update the intent parsing logic

### Adding New Admin Pages

1. Create a new page in `src/app/admin/`
2. Add navigation link in `src/components/admin/Sidebar.tsx`
3. Implement the page with appropriate components
4. Add API endpoints if needed

### Customizing the UI

- Modify components in `src/components/ui/`
- Update the design system in `tailwind.config.ts`
- Add new animations in component files

## 🚀 Deployment

### Production Setup

1. Set up a PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Build and deploy the Next.js app
5. Deploy the AI agent service
6. Configure WebSocket connections

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# AI/LLM
OPENAI_API_KEY="sk-..."
OPENAI_API_BASE="https://api.openai.com/v1"

# Vector Database
PINECONE_API_KEY="..."
PINECONE_INDEX_NAME="sitemind-agent-memory"

# Next.js
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://your-domain.com"
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🔧 Troubleshooting

### Common Issues

#### LMStudio Connection Issues

- Make sure LMStudio is running on port 1234
- Verify the model is available in LMStudio (the system will auto-load it)
- Check that the API endpoint is accessible: `http://localhost:1234/v1/models`
- If you have multiple models, the system will target the specific model: `llama-3.2-8x3b-moe-dark-champion-instruct-uncensored-abliterated-18.4b`
- Check the console logs for model loading status

#### WebSocket Connection Issues

- Ensure the AI agent service is running on port 3001
- Check browser console for WebSocket connection errors
- Verify firewall settings allow local connections

#### Database Connection Issues

- Make sure PostgreSQL is running
- Verify the DATABASE_URL in your .env file
- Run `npx prisma db push` to create the schema

#### Dependency Issues

- Use `--legacy-peer-deps` flag when installing packages
- Clear node_modules and package-lock.json if needed
- Ensure Node.js version is 18 or higher

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
DEBUG=*
```

## 📞 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the AI agent logs for debugging
- Check the browser console for frontend issues

---

**Built with ❤️ for the future of AI-native e-commerce**

# Orbit Project

This is the Orbit project, a cognitive productivity system that adapts to your mental state and energy levels.

## Features

- **Adaptive Interface**: Changes based on your current mode (Build/Flow/Restore)
- **Contextual Messaging**: Intelligent, situation-aware assistant responses
- **Task Management**: AI-assisted task breakdown and prioritization
- **Reflection Tracking**: Log your mood and energy levels
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

- `/client`: Frontend React application (Vite + TypeScript + TailwindCSS)
- `/server`: Backend server (Node.js + Express)
  - `/contextual`: Contextual message generation system
  - `/prisma`: Database schema and migrations
  - `/routes`: API endpoints
- `/prisma`: Database schema and migrations

## Contextual Message System

The application includes a sophisticated contextual message system that generates appropriate responses based on user actions and system events. See the [Contextual Message System Documentation](./server/contextual/README.md) for details.

## Contextual Assistant Messages

Trigger messages by sending a POST request to `/api/contextual-message`.

**Example Payloads:**

```json
{
  "trigger": "mode_change",
  "context": { "mode": "flow" }
}

{
  "trigger": "energy_low",
  "context": { "energy": 25 }
}

{
  "trigger": "chat_opened",
  "context": { "timeOfDay": "evening" }
}
```

**Available Triggers:**
- `mode_change`: When the user changes their mode (build/flow/restore)
- `energy_low`: When the system detects low user energy
- `reflection_logged`: When a user logs a reflection
- `no_task`: When there are no active tasks
- `chat_opened`: When the chat interface is opened

## Getting Started

This is the Orbit project, set up for local development.

## Orbit Local Development Setup

To run this project locally, follow these steps:

1.  **Clone the repository** (if you haven't already).

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**:
    -   Copy the `.env.example` file to a new file named `.env`:
        ```bash
        cp .env.example .env
        ```
    -   Open the `.env` file and fill in the required environment variables:
        -   `DATABASE_URL`: Your PostgreSQL connection string. The project was originally configured for Neon (a serverless Postgres provider), but any standard PostgreSQL instance should work. Example: `postgresql://user:password@host:port/database`
        -   `OPENAI_API_KEY`: Your API key for OpenAI services.

4.  **Database Migrations** (After setting `DATABASE_URL`):
    The project uses Drizzle ORM. To apply database schema migrations, run:
    ```bash
    npm run db:push
    ```
    *Note: You may need to ensure your database is running and accessible before this step.*

5.  **Run the Development Server**:
    ```bash
    npm run dev
    ```
    - This command starts both the backend Express server and the frontend Vite development server.
    - The server starts on port 5001 (check console output). The Vite client will likely be on a different port (e.g., 5173) and proxy requests to the backend.
    - Open your browser and navigate to the client URL provided in the console (usually `http://localhost:5173` or similar).

6.  **Access the application**:
    Open your browser and navigate to the client URL provided in the console (usually `http://localhost:5173` or similar).

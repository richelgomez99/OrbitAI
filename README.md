# Orbit Project

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

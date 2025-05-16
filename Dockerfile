# ---- Builder Stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package.json package-lock.json* ./

# Install all dependencies, including devDependencies needed for the build
RUN npm install

# Copy the rest of the application source code
COPY . .

# Run the build script (builds frontend and backend)
# Assumes vite outputs to client/dist and esbuild to dist
RUN npm run build

# ---- Runner Stage ----
FROM node:20-alpine AS runner
WORKDIR /app

# Set Node environment to production
ENV NODE_ENV=production

# Copy package.json and package-lock.json for installing production dependencies
COPY package.json package-lock.json* ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the built backend from the builder stage
COPY --from=builder /app/dist ./dist

# Copy the built frontend from the builder stage
# Vite builds to /app/dist/public (relative to project root in builder)
# Express serves from ./server/public (relative to project root in runner)
COPY --from=builder /app/dist/public ./server/public

# The application will listen on the port specified by the PORT env var (set by Fly.io)
# or fall back to 5001, as configured in server/index.ts.
# The host 0.0.0.0 is also correctly set in server/index.ts.

# Copy the Prisma schema and migrations from the builder stage
COPY --from=builder /app/prisma ./prisma

# Command to start the application
CMD ["node", "dist/index.js"]

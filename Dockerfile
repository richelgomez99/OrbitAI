# ---- Builder Stage ----
FROM node:20-slim AS builder
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package.json ./package.json
RUN ls -l /app/package.json && echo "--- Contents of /app/package.json after first COPY in BUILDER stage ---" && cat /app/package.json && echo "--- End of /app/package.json after first COPY in BUILDER stage ---"
COPY package-lock.json* ./

# Inspect package.json content in BUILDER stage
RUN echo "--- Contents of /app/package.json in BUILDER stage (after lockfile copy) ---" && cat /app/package.json && echo "--- End of /app/package.json in BUILDER stage (after lockfile copy) ---"

# Install all dependencies, including devDependencies needed for the build
RUN npm install

ENV NODE_ENV=production

# Copy the rest of the application source code
COPY . .

# Remove files that interfere with the esbuild process
RUN rm -f server/dev.ts server/vite-dev-setup.ts server/vite.ts

# Explicitly generate Prisma client
RUN npx prisma generate --schema=/app/prisma/schema.prisma

# Verify Prisma client generation in builder
RUN echo "--- Listing Prisma client files in BUILDER stage after generate: ---" && \
    (ls -R /app/node_modules/.prisma/client && ls -R /app/node_modules/@prisma/client/runtime) || \
    echo "--- Prisma client files not found or ls failed in BUILDER ---"

# Run the build script (builds frontend and backend)
# Assumes vite outputs to client/dist and esbuild to dist
RUN npm run build

# ---- Runner Stage ----
FROM node:20-slim AS runner
ENV NODE_ENV=production
ENV PRISMA_SCHEMA_PATH=/app/prisma/schema.prisma
WORKDIR /app

# Set Node environment to production
ENV NODE_ENV=production

# Copy package.json and package-lock.json for installing production dependencies
COPY package.json ./package.json
RUN ls -l /app/package.json && echo "--- Contents of /app/package.json after first COPY in RUNNER stage ---" && cat /app/package.json && echo "--- End of /app/package.json after first COPY in RUNNER stage ---"
COPY package-lock.json* ./

# Inspect package.json content
RUN echo "--- Contents of /app/package.json in RUNNER stage (after lockfile copy) ---" && cat /app/package.json && echo "--- End of /app/package.json in RUNNER stage (after lockfile copy) ---"

# Install only production dependencies
RUN npm install --omit=dev

# Copy the generated Prisma client (including query engine) from the builder stage
COPY --from=builder /app/node_modules/.prisma/client /app/node_modules/.prisma/client
COPY --from=builder /app/node_modules/@prisma/client/runtime /app/node_modules/@prisma/client/runtime

# Verify Prisma client files in runner
RUN echo "--- Listing Prisma client files in RUNNER stage after copy: ---" && \
    (ls -R /app/node_modules/.prisma/client && ls -R /app/node_modules/@prisma/client/runtime) || \
    echo "--- Prisma client files not found or ls failed in RUNNER ---"

# Copy the built backend from the builder stage
COPY --from=builder /app/dist ./dist

# Frontend assets (from /app/dist/public in builder) are included in the './dist' directory copied above.

# The application will listen on the port specified by the PORT env var (set by Fly.io)
# or fall back to 5001, as configured in server/index.ts.
# The host 0.0.0.0 is also correctly set in server/index.ts.

# Copy the Prisma schema and migrations from the builder stage
COPY --from=builder /app/prisma ./prisma

# Switch to non-root user for security
USER node

# Command to start the application
CMD ["node", "dist/index.js"]

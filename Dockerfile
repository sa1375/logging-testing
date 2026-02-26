# Dockerfile

# ---- deps (install only prod deps for runtime later) ----
FROM node:24.14.0-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---- build ----
FROM node:24.14.0-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runtime ----
FROM node:24.14.0-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# only what we need
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# non-root user is recommended for safety purposes
USER node

EXPOSE 3000
CMD ["node", "dist/main.js"]
# Community Connect API
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Install production dependencies first (cached between builds)
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

# Run as the unprivileged "node" user
USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- "http://localhost:${PORT:-5000}/api/health" || exit 1

CMD ["node", "index.js"]

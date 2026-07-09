FROM node:22-slim

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace files needed for the bot
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json tsconfig.json ./
COPY artifacts/discord-bot ./artifacts/discord-bot

# Install only the discord-bot dependencies
RUN pnpm install --filter @workspace/discord-bot

WORKDIR /app/artifacts/discord-bot

CMD ["npx", "tsx", "src/index.ts"]

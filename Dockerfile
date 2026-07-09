FROM node:22-slim

RUN npm install -g tsx

WORKDIR /app

# Copy only the discord bot files
COPY artifacts/discord-bot/src ./src
COPY artifacts/discord-bot/tsconfig.json ./tsconfig.json

# Create a standalone package.json with explicit versions
RUN echo '{ \
  "name": "discord-bot", \
  "version": "1.0.0", \
  "type": "module", \
  "dependencies": { \
    "discord.js": "^14.16.3" \
  } \
}' > package.json

RUN npm install

CMD ["tsx", "src/index.ts"]

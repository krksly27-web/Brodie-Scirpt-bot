#!/bin/bash
# Start Discord bot in background
pnpm --filter @workspace/discord-bot run start &
DISCORD_PID=$!

echo "[start-prod] Discord bot started (PID $DISCORD_PID)"

# Start API server in foreground — when it exits, stop the bot too
node --enable-source-maps "$(cd "$(dirname "$0")" && pwd)/dist/index.mjs"
EXIT_CODE=$?

echo "[start-prod] API server exited ($EXIT_CODE), stopping Discord bot"
kill "$DISCORD_PID" 2>/dev/null || true
exit $EXIT_CODE

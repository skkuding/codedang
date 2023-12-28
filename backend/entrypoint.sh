#!/bin/sh
npx prisma migrate deploy
node /app/dist/apps/$TARGET/main.js

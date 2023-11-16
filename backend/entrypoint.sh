#!/bin/sh
npx prisma migrate deploy
node /app/apps/$TARGET/main.js

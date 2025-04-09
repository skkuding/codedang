#!/bin/sh
npx prisma migrate deploy
node --experimental-require-module /app/dist/apps/$TARGET/main.js

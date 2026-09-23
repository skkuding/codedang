#!/bin/sh
npx prisma migrate deploy
exec node /app/dist/apps/$TARGET/main.js

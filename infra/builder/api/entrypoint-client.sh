#!/bin/sh
npx prisma migrate deploy
node dist/apps/client/main.js

#!/bin/sh
npx prisma migrate deploy
node dist/apps/admin/main.js

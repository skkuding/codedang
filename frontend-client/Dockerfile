FROM node:18-alpine AS base

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY frontend-client/package.json ./frontend-client/
RUN npm install -g pnpm && pnpm --filter frontend-client i --frozen-lockfile
COPY ./frontend-client ./frontend-client

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm --filter frontend-client build

# If using npm comment out above and use below instead
# RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/frontend-client/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/frontend-client/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend-client/.next/static ./.next/static

USER nextjs

EXPOSE 5525

ENV PORT 5525
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

CMD ["node", "frontend-client/server.js"]

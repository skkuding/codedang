# [NOTE] Build image from the root directory of this repository.
# ex) `docker build -f apps/frontend/Dockerfile .`

ARG BASEURL="https://codedang.com/api"
ARG GQL_BASEURL="https://codedang.com/graphql"
ARG RUNNER_BASEURL="wss://run.codedang.com/run"
ARG ADMIN_REST_URL=https://stage.codedang.com/admin-api

FROM node:22.18.0-alpine AS base

### BUILD ###
FROM base AS build

WORKDIR /build

COPY pnpm-workspace.yaml .
COPY package.json .
COPY pnpm-lock.yaml .
COPY apps/frontend/package.json apps/frontend/

RUN corepack enable && pnpm install --frozen-lockfile

COPY apps/frontend apps/frontend
COPY apps/backend/schema.gql apps/backend/

WORKDIR /build/apps/frontend

ARG BASEURL
ARG GQL_BASEURL
ARG RUNNER_BASEURL
ARG ADMIN_REST_URL

ENV NEXT_PUBLIC_BASEURL=${BASEURL}
ENV NEXT_PUBLIC_GQL_BASEURL=${GQL_BASEURL}
ENV NEXT_PUBLIC_RUNNER_BASEURL=${RUNNER_BASEURL}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_ADMIN_REST_URL=${ADMIN_REST_URL}

# TODO: use cache mount
# RUN --mount=type=cache,target=/build/apps/frontend/.next/cache pnpm build
RUN pnpm build

### PRODUCTION ###
FROM base AS production

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir -p apps/frontend/.next
RUN chown nextjs:nodejs apps/frontend/.next

COPY --from=build --chown=nextjs:nodejs /build/apps/frontend/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /build/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=build --chown=nextjs:nodejs /build/apps/frontend/public ./apps/frontend/public

USER nextjs

ENV NODE_ENV=production
ENV PORT=5525

ARG BASEURL
ARG GQL_BASEURL
ARG RUNNER_BASEURL

ENV NEXT_PUBLIC_BASEURL=${BASEURL}
ENV NEXT_PUBLIC_GQL_BASEURL=${GQL_BASEURL}
ENV NEXT_PUBLIC_RUNNER_BASEURL=${RUNNER_BASEURL}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_ADMIN_REST_URL=${ADMIN_REST_URL}

CMD ["node", "apps/frontend/server.js"]

# [NOTE] Build image from the root directory of this repository.
# ex) `docker build -f apps/frontend/Dockerfile .`

ARG BASEURL="https://codedang.com/api"
ARG GQL_BASEURL="https://codedang.com/graphql"
ARG RUNNER_BASEURL="wss://run.codedang.com/run"
ARG CHANNEL_TALK_KEY="2f5b48ae-a587-431f-8106-2842c4403bc7"

### BUILD ###
FROM node:22.18.0-alpine AS build

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
ARG CHANNEL_TALK_KEY
ARG RUNNER_BASEURL

ENV NEXT_PUBLIC_BASEURL=${BASEURL}
ENV NEXT_PUBLIC_GQL_BASEURL=${GQL_BASEURL}
ENV NEXT_PUBLIC_CHANNEL_PLUGIN_KEY=${CHANNEL_TALK_KEY}
ENV NEXT_PUBLIC_RUNNER_BASEURL=${RUNNER_BASEURL}
ENV NEXTAUTH_URL="https://codedang.com/next-auth/api/auth"

RUN pnpm build

### INSTALL PACKAGES ###
FROM node:22.18.0-alpine AS install

WORKDIR /app
COPY pnpm-workspace.yaml .
COPY package.json .
COPY pnpm-lock.yaml .
COPY apps/frontend/package.json apps/frontend/

RUN corepack enable && pnpm deploy --filter=@codedang/frontend --prod /app/install

### PRODUCTION ###
FROM node:22.18.0-alpine AS production

WORKDIR /app

COPY --from=build /build/apps/frontend/.next/standalone ./
COPY --from=build /build/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=build /build/apps/frontend/public ./apps/frontend/public
COPY --from=install /app/install/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=5525
ENV NEXT_TELEMETRY_DISABLED=1

ARG BASEURL
ARG GQL_BASEURL
ARG CHANNEL_TALK_KEY
ARG RUNNER_BASEURL

ENV NEXT_PUBLIC_BASEURL=${BASEURL}
ENV NEXT_PUBLIC_GQL_BASEURL=${GQL_BASEURL}
ENV NEXT_PUBLIC_CHANNEL_PLUGIN_KEY=${CHANNEL_TALK_KEY}
ENV NEXT_PUBLIC_RUNNER_BASEURL=${RUNNER_BASEURL}

CMD ["node", "apps/frontend/server.js"]

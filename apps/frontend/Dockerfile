# [NOTE] Build image from the root directory of this repository.
# ex) `docker build -f apps/frontend/Dockerfile .`

### BUILD ###
FROM node:22.17.1-alpine AS build

WORKDIR /build

COPY pnpm-workspace.yaml .
COPY package.json .
COPY pnpm-lock.yaml .
COPY apps/frontend/package.json apps/frontend/

RUN corepack enable && pnpm install --frozen-lockfile

COPY apps/frontend apps/frontend
COPY apps/backend/schema.gql apps/backend/

WORKDIR /build/apps/frontend

RUN pnpm build

### INSTALL PACKAGES ###
FROM node:22.17.1-alpine AS install

WORKDIR /app
COPY pnpm-workspace.yaml .
COPY package.json .
COPY pnpm-lock.yaml .
COPY apps/frontend/package.json apps/frontend/

RUN corepack enable && pnpm deploy --filter=@codedang/frontend --prod /app/install

### PRODUCTION ###
FROM node:22.17.1-alpine AS production

WORKDIR /app

COPY --from=build /build/apps/frontend/.next/standalone ./
COPY --from=build /build/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=build /build/apps/frontend/public ./apps/frontend/public
COPY --from=install /app/install/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=5525

CMD ["node", "apps/frontend/server.js"]

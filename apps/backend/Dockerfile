# [NOTE] Build image from the root directory of this repository.
# ex) `docker build -f apps/backend/Dockerfile .`

### BUILDER ###
ARG target=client
ARG app_env=production

FROM node:22.22.0-alpine AS builder
ARG target

# Install bash for swc-node
RUN apk add --no-cache bash

COPY . /build
WORKDIR /build

# https://github.com/nodejs/corepack/issues/612 해결되면 다시 corepack 사용
# RUN corepack enable
RUN npm install -g pnpm
RUN pnpm --filter="@codedang/backend" deploy out

WORKDIR /build/out
RUN npx prisma generate
RUN npm run build ${target}

### PRODUCTION ###
FROM node:22.22.0-alpine
ARG target
ARG app_env

# Install bash for swc-node in production
RUN apk add --no-cache bash

ENV APP_ENV=${app_env}
ENV TARGET=${target}

COPY --from=builder /build/out /app
COPY ./apps/backend/entrypoint.sh /app
WORKDIR /app

ENTRYPOINT ["/app/entrypoint.sh"]

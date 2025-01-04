# [NOTE] Build image from the root directory of this repository.
# ex) `docker build -f apps/backend/Dockerfile .`

### BUILDER ###
ARG target=client
ARG app_env=production

FROM node:20.18.1-alpine AS builder
ARG target

COPY . /build
WORKDIR /build

RUN corepack enable
RUN pnpm --filter="@codedang/backend" deploy out

WORKDIR /build/out
RUN npx prisma generate
RUN npm run build ${target}

### PRODUCTION ###
FROM node:20.18.1-alpine
ARG target
ARG app_env

ENV APP_ENV=${app_env}
ENV TARGET=${target}

COPY --from=builder /build/out /app
COPY ./apps/backend/entrypoint.sh /app
WORKDIR /app

ENTRYPOINT ["/app/entrypoint.sh"]

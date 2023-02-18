# [NOTE] Build image from the root directory of this repository.
# ex) `docker build -f deploy/backend/Dockerfile .`

### BUILDER ###
FROM node:18-alpine AS builder

COPY . /build
WORKDIR /build

RUN corepack enable
RUN pnpm --filter=backend deploy out

### PRODUCTION ###
FROM node:18-alpine

COPY --from=builder /build/out .

RUN npx prisma generate && npm run build

CMD ["node", "dist/main.js"]

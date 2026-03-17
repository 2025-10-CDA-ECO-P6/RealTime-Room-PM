FROM node:lts-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web-api/package.json apps/web-api/package.json
COPY packages/backend/domain/package.json packages/backend/domain/package.json
COPY packages/backend/application/package.json packages/backend/application/package.json
COPY packages/backend/infrastructure/package.json packages/backend/infrastructure/package.json
COPY packages/shared/di/package.json packages/shared/di/package.json
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app ./
COPY . .
RUN pnpm --filter web-api exec tsc -b --force
RUN test -f /app/apps/web-api/dist/server.js
RUN test -f /app/packages/backend/domain/dist/index.js
RUN test -f /app/packages/backend/application/dist/index.js
RUN test -f /app/packages/backend/infrastructure/dist/index.js
RUN test -f /app/packages/shared/di/dist/index.js

FROM node:lts-alpine AS runtime
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app

RUN corepack enable \
 && addgroup -S appgroup \
 && adduser -S appuser -G appgroup

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web-api/package.json apps/web-api/package.json
COPY packages/backend/domain/package.json packages/backend/domain/package.json
COPY packages/backend/application/package.json packages/backend/application/package.json
COPY packages/backend/infrastructure/package.json packages/backend/infrastructure/package.json
COPY packages/shared/di/package.json packages/shared/di/package.json

RUN pnpm install --prod --frozen-lockfile --filter web-api...

COPY --from=build /app/apps/web-api/dist ./apps/web-api/dist
COPY --from=build /app/packages/backend/domain/dist ./packages/backend/domain/dist
COPY --from=build /app/packages/backend/application/dist ./packages/backend/application/dist
COPY --from=build /app/packages/backend/infrastructure/dist ./packages/backend/infrastructure/dist
COPY --from=build /app/packages/shared/di/dist ./packages/shared/di/dist

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "apps/web-api/dist/server.js"]
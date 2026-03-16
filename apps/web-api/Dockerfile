FROM node:22.14-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app
RUN corepack enable

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter web-api... run build

FROM node:22.14-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --chown=appuser:appgroup pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY --chown=appuser:appgroup apps/web-api/package.json apps/web-api/package.json
COPY --chown=appuser:appgroup packages/backend/domain/package.json packages/backend/domain/package.json
COPY --chown=appuser:appgroup packages/backend/infrastructure/package.json packages/backend/infrastructure/package.json
COPY --chown=appuser:appgroup packages/backend/application/package.json packages/backend/application/package.json

RUN pnpm install --prod --frozen-lockfile --filter web-api... --ignore-scripts

COPY --chown=appuser:appgroup --from=build /app/apps/web-api/dist ./apps/web-api/dist
COPY --chown=appuser:appgroup --from=build /app/packages/backend/domain/dist ./packages/backend/domain/dist
COPY --chown=appuser:appgroup --from=build /app/packages/backend/infrastructure/dist ./packages/backend/infrastructure/dist
COPY --chown=appuser:appgroup --from=build /app/packages/backend/application/dist ./packages/backend/application/dist

USER appuser

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

EXPOSE 3000
CMD ["node", "apps/web-api/dist/server.js"]
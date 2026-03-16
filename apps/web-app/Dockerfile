# Build stage
FROM node:lts-alpine AS build
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web-app/package.json apps/web-app/package.json
RUN corepack enable
RUN pnpm install --filter web-app... --frozen-lockfile
COPY . .
RUN pnpm --filter web-app build

# Prod stage
FROM nginx:alpine AS production
COPY --from=build /app/apps/web-app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
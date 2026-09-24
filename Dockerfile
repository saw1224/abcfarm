FROM node:22-bookworm-slim

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build && chmod +x /app/server/entrypoint.sh

EXPOSE 8080

VOLUME ["/data"]

ENTRYPOINT ["/app/server/entrypoint.sh"]

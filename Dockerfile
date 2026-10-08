FROM oven/bun:1.4.2 AS bun
FROM node:22-bookworm-slim AS build
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
ARG NEXT_PUBLIC_BASE_PATH=/megpt
ARG NEXT_PUBLIC_SITE_URL=https://yoder.ing
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_TELEMETRY_DISABLED=1
RUN bun run build

FROM caddy:2-alpine
COPY --from=build /app/out /srv
COPY --from=build /app/.static/Caddyfile /etc/caddy/Caddyfile
EXPOSE 8080

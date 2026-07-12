# Fantasy Draft Nite runs as a Cloudflare Worker (D1 binding, `cloudflare:workers`
# runtime module), not a plain Node server. To self-host it in Docker we run the
# built Worker bundle on Cloudflare's own local runtime via `wrangler dev`
# (Miniflare/workerd) instead of Cloudflare's cloud — no Cloudflare account
# needed, D1 persists to a local SQLite file inside the container.

FROM oven/bun:1.3-slim AS builder
WORKDIR /repo

# Install deps first (cache layer): manifests + the local workspace packages
# that @higgsfield/fnf, @higgsfield/fnf-react and @higgsfield/quanta resolve to.
COPY app/package.json app/bun.lock app/bunfig.toml ./
COPY app/packages ./packages
RUN bun install --frozen-lockfile

# Now the rest of the app source, then typecheck + build the SSR worker bundle
# (dist/server/server.js) and the static client (dist/client).
COPY app/ ./
RUN bun run typecheck && bunx vite build

# wrangler explicitly does not support running under Bun (its DevTools/inspector
# websocket handshake fails there — confirmed: the dev server never comes up).
# Node runs it as intended.
FROM node:24-slim AS runtime
WORKDIR /app
ENV WRANGLER_SEND_METRICS=false
RUN npm install -g wrangler@^4

COPY --from=builder /repo/dist ./dist
COPY --from=builder /repo/migrations ./migrations
COPY wrangler.docker.jsonc ./wrangler.jsonc

EXPOSE 8080
VOLUME ["/data"]

CMD ["wrangler", "dev", "--port", "8080", "--ip", "0.0.0.0", "--persist-to", "/data"]

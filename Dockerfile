ARG SOURCE_DATE_EPOCH=0

FROM node:24.18.1-alpine@sha256:f70403e87646dc51b45295f4b8b70cdad0b63d2297c4c9899119b03f7af7a6b3 AS build-stage

ARG RETROZETRO_RELEASE_VERSION
ARG SOURCE_DATE_EPOCH
ARG SOURCE_REVISION

WORKDIR /app

ENV CYPRESS_INSTALL_BINARY=0 \
    PUPPETEER_SKIP_DOWNLOAD=true \
    RETROZETRO_RELEASE_VERSION=$RETROZETRO_RELEASE_VERSION \
    SOURCE_DATE_EPOCH=$SOURCE_DATE_EPOCH \
    SOURCE_REVISION=$SOURCE_REVISION

RUN npm install --global npm@12.0.2 \
    && test "$(node --version)" = "v24.18.1" \
    && test "$(npm --version)" = "12.0.2"

COPY .npmrc package.json package-lock.json ./
COPY front-end/package.json ./front-end/package.json
COPY back-end/package.json ./back-end/package.json
RUN npm ci --include=optional --strict-allow-scripts

COPY . .
RUN node -e ' \
      const [declaredVersion, revision] = process.argv.slice(1); \
      const packageVersion = require("./package.json").version; \
      if (declaredVersion.replace(/^v/, "") !== packageVersion \
        || !/^[0-9a-f]{40}$/.test(revision)) process.exit(1); \
    ' "$RETROZETRO_RELEASE_VERSION" "$SOURCE_REVISION" \
    && npm run build \
    && test -f /app/back-end/dist/server.js \
    && test -f /app/front-end/dist/release.json

FROM node:24.18.1-alpine@sha256:f70403e87646dc51b45295f4b8b70cdad0b63d2297c4c9899119b03f7af7a6b3 AS production-dependencies

WORKDIR /app

RUN npm install --global npm@12.0.2

COPY .npmrc package.json package-lock.json ./
COPY front-end/package.json ./front-end/package.json
COPY back-end/package.json ./back-end/package.json
RUN npm ci \
      --omit=dev \
      --workspace back-end \
      --include-workspace-root=false \
      --ignore-scripts \
      --no-audit \
      --no-fund \
    && npm rebuild argon2 --foreground-scripts --no-audit --no-fund \
    && node -e 'require("argon2")' \
    && node -e ' \
      const fs = require("node:fs"); \
      for (const target of [ \
        "/app/node_modules/typescript", \
        "/app/node_modules/.bin/tsc", \
        "/app/node_modules/.bin/tsserver", \
      ]) fs.rmSync(target, { force: true, recursive: true }); \
    '

FROM node:24.18.1-alpine@sha256:f70403e87646dc51b45295f4b8b70cdad0b63d2297c4c9899119b03f7af7a6b3 AS production-stage

ARG RETROZETRO_RELEASE_VERSION
ARG SOURCE_REVISION

WORKDIR /app

ENV NODE_ENV=production \
    PORT=8080 \
    RETROZETRO_RELEASE_VERSION=$RETROZETRO_RELEASE_VERSION \
    SOURCE_REVISION=$SOURCE_REVISION \
    STATIC_SITE_DIR=/app/front-end/dist

RUN rm -rf /usr/local/lib/node_modules/npm \
    && rm -rf /usr/local/lib/node_modules/corepack \
    && rm -f /usr/local/bin/npm /usr/local/bin/npx \
       /usr/local/bin/corepack /usr/local/bin/pnpm /usr/local/bin/pnpx \
       /usr/local/bin/yarn /usr/local/bin/yarnpkg \
    && install -d -m 0700 -o node -g node /app/back-end/uploads

COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=production-dependencies --chown=node:node /app/back-end/node_modules ./back-end/node_modules
COPY --from=build-stage --chown=node:node /app/back-end/dist ./back-end/dist
COPY --from=build-stage --chown=node:node /app/front-end/dist ./front-end/dist
RUN node --input-type=module -e 'await import("./back-end/dist/app.js")'

USER node

VOLUME ["/app/back-end/uploads"]
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD ["node", "-e", "fetch('http://127.0.0.1:8080/healthz').then(response => { if (!response.ok) process.exit(1) }).catch(() => process.exit(1))"]

CMD ["node", "back-end/dist/server.js"]

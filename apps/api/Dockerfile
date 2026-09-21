FROM node:22-bookworm-slim AS build

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/api-contract/package.json packages/api-contract/package.json

RUN pnpm install --frozen-lockfile

COPY apps/api apps/api
COPY packages packages

RUN pnpm --filter @devhub-404/api build

RUN pnpm --filter @devhub-404/api deploy --legacy --prod /out
RUN cp -r apps/api/dist /out/dist

FROM node:22-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=build /out/dist ./dist
COPY --from=build /out/package.json ./package.json
COPY --from=build /out/node_modules ./node_modules

EXPOSE 8080

CMD ["node", "--import", "./dist/runtime-globals.mjs", "./dist/main.js"]

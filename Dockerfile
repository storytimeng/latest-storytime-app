FROM node:18 AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .

# ✅ run tailwind debug during build
RUN node debug-tailwind.js

RUN pnpm build

FROM node:18 AS runner
WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000
CMD ["pnpm", "start"]

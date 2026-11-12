FROM node:24-bookworm-slim

WORKDIR /app

# Required by Prisma's engine and TLS connections
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install locked dependencies
COPY package*.json ./

RUN npm ci

# Copy application and Prisma files
COPY . .

# Generate Prisma 6 client inside Linux
RUN npx prisma generate

# Compile NestJS
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Apply existing migrations before starting NestJS
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
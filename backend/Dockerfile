FROM node:22-slim
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
ENV NODE_ENV=production
EXPOSE 5000
# Apply pending migrations, then start the API.
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]

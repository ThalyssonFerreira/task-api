FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache ca-certificates


COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production
EXPOSE 3000


CMD ["sh", "-c", "npm run db:migrate:up && node src/server.js"]

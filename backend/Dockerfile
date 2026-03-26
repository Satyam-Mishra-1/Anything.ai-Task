FROM node:22-alpine

WORKDIR /app

ENV DATABASE_URL=mongodb://localhost:27017/p3

COPY package.json package-lock.json* ./

# Copy Prisma schema early so `prisma generate` can run during build.
COPY prisma ./prisma

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run prisma:generate
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npm run prisma:deploy && npm start"]


FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY apps/api/package*.json ./

# Install dependencies
RUN npm ci

# Copy prisma schema
COPY apps/api/prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY apps/api/src ./src/
COPY apps/api/tsconfig.json ./
COPY apps/api/nest-cli.json ./
COPY apps/api/test ./test/

# Build application
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY apps/web/package*.json ./

# Install dependencies
RUN npm ci

# Copy configuration files
COPY apps/web/next.config.js ./
COPY apps/web/tailwind.config.js ./
COPY apps/web/postcss.config.js ./
COPY apps/web/tsconfig.json ./
COPY apps/web/next-env.d.ts ./

# Copy source code
COPY apps/web/src ./src/
COPY apps/web/public ./public/

# Build application
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
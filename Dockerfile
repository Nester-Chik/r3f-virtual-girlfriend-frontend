# Use official Node.js image for build
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the app
COPY . .

# Build the app
RUN yarn build

# ---
# Production image to serve the build
FROM node:18-alpine AS production
WORKDIR /app

# Install a simple static file server
RUN yarn global add serve

# Copy built assets from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./

# Expose port 8080 (Railway default for static sites)
EXPOSE 8080

# Serve the static site
CMD ["serve", "-s", "dist", "-l", "8080"] 
FROM node:20-alpine AS build
WORKDIR /app

# VITE_API_URL is baked in at build time (Vite env vars are compile-time,
# not runtime), so it must be passed as a build arg, not a container env var.
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]

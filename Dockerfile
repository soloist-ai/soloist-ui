# Build stage
FROM oven/bun:1-alpine AS build
WORKDIR /app

# Commit SHA for version.json (passed from CI via --build-arg)
ARG GIT_COMMIT_SHA
ENV GIT_COMMIT_SHA=$GIT_COMMIT_SHA

# Режим «технические работы»: при true приложение показывает только экран обслуживания
ARG REACT_APP_MAINTENANCE_MODE=false
ENV REACT_APP_MAINTENANCE_MODE=$REACT_APP_MAINTENANCE_MODE

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
# Используем production сборку для CI/CD
# Устанавливаем переменные окружения для production режима
ENV NODE_ENV=production
ENV REACT_APP_ENV=production
ENV REACT_APP_USE_MOCKS=false
# Собираем приложение в production режиме
RUN bun run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
# Custom nginx config: SPA routing + correct cache headers
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
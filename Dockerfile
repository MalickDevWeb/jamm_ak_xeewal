# ---------- Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --silent

# Copy source and build Angular (production)
COPY . .
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
RUN npx ng build --configuration=production

# ---------- Runtime (Nginx) ----------
FROM nginx:stable-alpine
RUN apk add --no-cache gettext

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=builder /app/dist/jamm-angular/browser /usr/share/nginx/html

# Copy env template and custom Nginx config
COPY src/assets/env.template.js /usr/share/nginx/html/assets/env.template.js
COPY nginx.template.conf /etc/nginx/conf.d/nginx.template.conf

# Environment variables (will be injected at runtime)
ENV API_URL=""
ENV BAC_OFFICE_URL=""
ENV VAPID_PUBLIC_KEY=""
ENV SENTRY_DSN=""
ENV PUBLIC_URL=""
ENV PUBLIC_EMAIL=""
ENV PUBLIC_SITE_URL=""
ENV VERSION=""
ENV PORT="80"

# Substitute variables into env.js and nginx.conf, then start Nginx
CMD ["sh", "-c", "envsubst '${API_URL} ${BAC_OFFICE_URL} ${VAPID_PUBLIC_KEY} ${SENTRY_DSN} ${PUBLIC_URL} ${PUBLIC_EMAIL} ${PUBLIC_SITE_URL} ${VERSION}' < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js && envsubst '${PORT}' < /etc/nginx/conf.d/nginx.template.conf > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'" ]

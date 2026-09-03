# Étape 1 : Build Angular (URL injectée au runtime, pas en dur)
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx ng build --configuration=production

# Étape 2 : Serveur Nginx
FROM nginx:stable-alpine
RUN apk add --no-cache gettext

# Supprimer config par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier fichiers build
COPY --from=builder /app/dist/jamm-angular/browser /usr/share/nginx/html

# Copier template env + config Nginx
COPY src/assets/env.template.js /usr/share/nginx/html/assets/env.template.js
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Variables d'environnement (fallback Vercel)
ENV API_URL="https://backofficexammakxeewal.vercel.app/api/v1"
ENV SENTRY_DSN="https://2fbcffec5a5f1c0b0423f2ad48264833@o4512013434683392.ingest.de.sentry.io/4512013443530832"
ENV VAPID_PUBLIC_KEY="BNmas-sTgL2czxhDmQ7yvSMQ4X9X_LbUYyExcB_5e6XnUMy091FPpIUhQNuKSsfWleYSHUBT0BGqVdec4tqfGOc"

EXPOSE 80
CMD ["sh", "-c", "envsubst '${API_URL} ${SENTRY_DSN} ${VAPID_PUBLIC_KEY}' < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js && nginx -g 'daemon off;'"]

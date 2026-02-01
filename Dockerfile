FROM nginx:alpine

# Copy all PWA files
COPY index.html /usr/share/nginx/html/index.html
COPY manifest.json /usr/share/nginx/html/manifest.json
COPY sw.js /usr/share/nginx/html/sw.js
COPY icons/ /usr/share/nginx/html/icons/

# Nginx config for PWA (proper MIME types and caching)
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # PWA Manifest \
    location /manifest.json { \
        add_header Content-Type application/manifest+json; \
    } \
    \
    # Service Worker \
    location /sw.js { \
        add_header Content-Type application/javascript; \
        add_header Cache-Control "no-cache"; \
        add_header Service-Worker-Allowed "/"; \
    } \
    \
    # SPA fallback \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

FROM nginx:stable-alpine
WORKDIR /app
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY htpasswd /etc/nginx/.htpasswd
COPY index.html /usr/share/nginx/html/index.html
EXPOSE 8198
CMD ["nginx", "-g", "daemon off;"]
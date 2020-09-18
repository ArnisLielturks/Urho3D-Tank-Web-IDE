# Compile the project
FROM node:12.15 as build
WORKDIR /app

COPY . /app


RUN npm install
RUN npm run build

# Build the app image
FROM alpine:latest
RUN apk update && \
	 apk add nginx && \
	 mkdir /run/nginx && \
	 touch /run/nginx/nginx.pid && \
	 mkdir /www

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /www
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT /entrypoint.sh

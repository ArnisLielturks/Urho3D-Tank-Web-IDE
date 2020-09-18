#!/bin/sh
touch /var/log/nginx/log.log
nginx
tail -f /var/log/nginx/log.log

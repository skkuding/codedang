FROM gitpod/workspace-full

COPY .env.development /tmp/.env

RUN cat /tmp/.env >> /etc/environment

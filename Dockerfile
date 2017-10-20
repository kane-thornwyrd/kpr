FROM keymetrics/pm2:8

RUN mkdir -p /api
WORKDIR /api

EXPOSE 443
EXPOSE 80

ENV NPM_CONFIG_LOGLEVEL warn


CMD [ "pm2-docker", "start", "pm2.json" ]

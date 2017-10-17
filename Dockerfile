FROM keymetrics/pm2:8

RUN mkdir -p /api/src
WORKDIR /api

COPY package.json /api/
COPY pm2.json /api/

EXPOSE 443
EXPOSE 80

ENV NPM_CONFIG_LOGLEVEL warn
ENV NODE_ENV production
RUN npm install

COPY src/ /api/src/

RUN ls -laR


CMD [ "pm2-docker", "start", "pm2.json" ]

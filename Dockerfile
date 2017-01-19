FROM node:7.4.0-alpine
MAINTAINER Christopher Madden <madden@netapp.com>

ADD . /srv/app
WORKDIR /srv/app
RUN npm install
EXPOSE 80
ENTRYPOINT ["node", "index.js"]
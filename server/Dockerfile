# stage 1: build stage
FROM node:18 AS builder

WORKDIR /app

COPY package.json ./

RUN npm install --production

COPY . ./

EXPOSE 5000

CMD [ "node","server.js" ]
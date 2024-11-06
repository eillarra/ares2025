FROM node:22-alpine AS develop-stage
RUN apk add --no-cache git
WORKDIR /app
COPY package*.json ./
RUN yarn global add @quasar/cli
COPY . .

FROM develop-stage AS build-stage
ARG APP_DOMAIN
ARG GIT_COMMIT_HASH
ARG SENTRY_AUTH_TOKEN

RUN yarn
RUN \
  APP_DOMAIN=${APP_DOMAIN} \
  GIT_COMMIT_HASH=${GIT_COMMIT_HASH} \
  SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN} \
  quasar build -m pwa

#############
# Build image
#############
FROM node:8-alpine AS builder

WORKDIR /usr/src/app

COPY . ./

RUN npm install --production
RUN npm run build

##################
# Production Image
##################
FROM node:8-alpine AS production

RUN apk --no-cache add curl

USER root

WORKDIR /usr/src/app

RUN mkdir mywod
RUN chown nobody:nobody -R /usr/src/app/mywod

USER nobody

COPY --from=builder /usr/src/app .

EXPOSE 43210

ENV SERVICE_NAME wodbook-api

HEALTHCHECK CMD curl --fail http://localhost:43210/health || exit 1

CMD [ "node", "./build/server.js" ]

############
# Test image
############
FROM production AS test

USER root
RUN npm install

RUN apk --no-cache add make grep git

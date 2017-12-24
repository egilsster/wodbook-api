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

USER nobody

COPY --from=builder /usr/src/app .

EXPOSE 43210

HEALTHCHECK CMD curl --fail http://localhost:21068/health || exit 1

CMD [ "node", "./build/server.js" ]

############
# Test image
############
FROM production AS test

USER root
RUN npm install

RUN apk --no-cache add make

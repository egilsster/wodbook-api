FROM node:10-alpine

WORKDIR /usr/src/app

COPY package.json ./
RUN yarn --production

COPY . ./
RUN npm run build

RUN apk --no-cache add curl

USER root

RUN mkdir mywod
RUN chown nobody:nobody -R /usr/src/app/mywod

USER nobody

EXPOSE 43210

HEALTHCHECK CMD curl --fail http://localhost:43210/health || exit 1

CMD [ "node", "./build/server.js" ]

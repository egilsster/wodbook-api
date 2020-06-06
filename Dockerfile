# TODO(egilsster): Optimize docker image https://shaneutt.com/blog/rust-fast-small-docker-image-builds/
# https://dev.to/sergeyzenchenko/actix-web-in-docker-how-to-build-small-and-secure-images-2mjd
# Custom healthcheck https://github.com/mastertinner/healthcheck
FROM rust:1.44-stretch
# FROM rust:alpine3.11

# RUN apk add --no-cache curl

RUN apt-get install --no-install-recommends --no-upgrade curl

WORKDIR /usr/src/app

COPY Cargo.toml Cargo.lock ./
COPY src/ src/

RUN cargo build
# RUN cargo build --release

# Copy additional files
COPY api-docs.yml ./

HEALTHCHECK CMD curl --fail http://localhost:43210/health || exit 1

CMD ["/usr/src/app/target/debug/wodbook-api"]

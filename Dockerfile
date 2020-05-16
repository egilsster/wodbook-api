FROM rust:latest

# RUN apk add --no-cache curl

WORKDIR /usr/src/wodbook-api

COPY . .

RUN cargo build
# RUN cargo build --release

RUN cargo install --path .

# HEALTHCHECK CMD curl --fail http://localhost:43210/health || exit 1

CMD ["/usr/local/cargo/bin/wodbook-api"]

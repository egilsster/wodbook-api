# wodbook-api

![Build status](https://github.com/egilsster/wodbook-api/workflows/build/badge.svg?branch=main)

Back-end for the [wodbook-app](https://github.com/egilsster/wodbook-app).

## Prerequisites

- Rust (1.43.0+)
- Docker
- docker-compose

## Usage

```sh
# Copy example .env file
λ cp .env.example .env

# Run docker containers
λ docker-compose -f docker-compose.deps.yml up -d

# Run unit tests
λ cargo test

# Run the server (Add --release for an optimized build)
λ cargo run
...
[2020-10-13T12:49:44Z INFO  wodbook_api::db::mongo] Connected to mongodb
[2020-10-13T12:49:44Z INFO  actix_server::builder] Starting 16 workers
[2020-10-13T12:49:44Z INFO  actix_server::builder] Starting "actix-web-service-0.0.0.0:43210" service on 0.0.0.0:43210
```

## APIs

See [api-docs](api-docs.yml)

## Scoring

Scores are sorted in the following order:

- By score
  - For timed workouts: descending (lowest value first)
  - For other workouts: ascending
- Wether it is Rx'd or not

That means the following order for timed workouts:

1. 100 seconds, non-Rx
2. 120 seconds, Rx
3. 120 seconds, non-Rx

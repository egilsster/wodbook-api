# wodbook-api

![Build status](https://github.com/egilsster/wodbook-api/workflows/build/badge.svg?branch=main)
![Audit status](https://github.com/egilsster/wodbook-api/workflows/audit/badge.svg?branch=main)
[![codecov](https://codecov.io/gh/egilsster/wodbook-api/branch/main/graph/badge.svg)](https://codecov.io/gh/egilsster/wodbook-api)

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
[2020-06-30T21:54:36Z INFO  wodbook_api::db::connection] Connected to mongodb
[2020-06-30T21:54:36Z INFO  wodbook_api] Listening on 0.0.0.0:43210
```

## APIs

See [api-docs](api-docs.yml)

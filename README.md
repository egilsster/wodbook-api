# wodbook-api

Back-end for the [wodbook-app](https://github.com/egilsster/wodbook-app).

## Requirements

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
Listening on http://127.0.0.1:43210/
```

### APIs

#### `GET /health`

```sh
curl http://localhost:43210/health
```

Returns

```json
{
  "status": "ok"
}
```

#### `POST /v1/users/register`

```sh
curl -X POST 'http://127.0.0.1:43210/v1/users/register' \
  -H "Content-Type: application/json" \
  --data '{
    "first_name": "first name",
    "last_name": "last name",
    "email": "user@email.com",
    "password": "password",
    "box_name": "My Box",
    "height": 189,
    "weight": 89000,
    "date_of_birth": "1991-12-06"
  }'
```

Returns

```json
{
  "user_id": "user-id",
  "email": "user@email.com",
  "first_name": "first name",
  "last_name": "last name",
  "date_of_birth": "1991-12-06",
  "height": 189,
  "weight": 89000,
  "box_name": "My Box",
  "avatar_url": ""
}
```

#### `POST /v1/users/login`

```sh
curl -X POST 'http://127.0.0.1:43210/v1/users/login' \
  -H "Content-Type: application/json" \
  --data '{
    "email": "user@email.com",
    "password": "password"
  }'
```

Returns

```json
{
    "token": "my-token"
}
```

#### `POST /v1/users/me`

```sh
curl -X GET 'http://127.0.0.1:43210/v1/users/me' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer TOKEN'
```

Returns

```json
{
  "user_id": "user-id",
  "email": "user@email.com",
  "password": "password-hash",
  "admin": false,
  "first_name": "first name",
  "last_name": "last name",
  "date_of_birth": "1991-12-06",
  "height": 189,
  "weight": 89000,
  "box_name": "My Box",
  "avatar_url": ""
}
```

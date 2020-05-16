# wodbook-api

Back-end for the [wodbook-app](https://github.com/egilsster/wodbook-app).

## Requirements

- Rust
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
Server started at http://127.0.0.1:43210
```

### APIs

#### `POST /user/register`

```sh
curl -X POST 'http://127.0.0.1:43210/user/register' \
  -H "Content-Type: application/json" \
  --data '{
    "name": "name",
     "surname": "surname",
    "email": "user@email.com",
    "password": "password"
  }'
```

Returns

```json
{
    "message": String,
    "status": bool
}
```

#### `POST /user/login`

```sh
curl -X POST 'http://127.0.0.1:43210/user/login' \
  -H "Content-Type: application/json" \
  --data '{
    "email": "user@email.com",
    "password": "password"
  }'
```

Returns

```json
{
    "message": String,
    "status": bool,
    "token": String
}
```

#### `POST /user/user/info`

```sh
curl -X GET 'http://127.0.0.1:43210/user/info' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer TOKEN'
```

Returns

```json
{
    "user_id": String,
    "name": String,
    "surname": String,
    "phone": String,
    "email": String,
    "password": String,
    "birth_date": String
}
```

#### `POST /user/protected`

```sh
curl -X GET 'http://127.0.0.1:43210/user/protected' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer TOKEN'
```

Returns

```txt
bool
```

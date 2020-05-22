# wodbook-api

Back-end for the [wodbook-app](https://github.com/egilsster/wodbook-app).

## Requirements

- Rust (1.43.0+)
- Docker
- docker-compose

## To read

- [ ] <https://blog.burntsushi.net/rust-error-handling/>

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

**For the following calls, the `TOKEN` is set on the environment: `export TOKEN=my-token**

#### `POST /v1/users/me`

```sh
curl -X GET 'http://127.0.0.1:43210/v1/users/me' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer '$TOKEN
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

#### `POST /v1/workouts/`

```sh
curl -X POST 'http://127.0.0.1:43210/v1/workouts/' \
  -H "Content-Type: application/json" \
  -H 'Authorization: Bearer '$TOKEN \
  --data '{
    "name": "Fran",
    "description": "21-15-9 Thruster (42.5kg / 30kg) / Pull ups",
    "measurement": "time"
  }'
```

Returns

```json
{
  "workout_id": "57d3eb04-ad31-4bd2-950a-2ec0057b23af",
  "name": "Fran",
  "measurement": "time",
  "description": "21-15-9 Thruster (42.5kg / 30kg) / Pull ups",
  "scores": [],
  "global": false,
  "created_at": "2020-05-22T11:32:08.962274+00:00",
  "updated_at": "2020-05-22T11:32:08.962274+00:00"
}
```

#### `POST /v1/workouts/:id`

```sh
curl -X POST 'http://127.0.0.1:43210/v1/workouts/57d3eb04-ad31-4bd2-950a-2ec0057b23af' \
  -H "Content-Type: application/json" \
  -H 'Authorization: Bearer '$TOKEN \
  --data '{
    "score": "4:20",
    "rx": true
  }'
```

Returns

```json
{
  "workout_score_id": "1a8d075b-1213-4d14-8a29-4fcf714ae6d0",
  "workout_id": "57d3eb04-ad31-4bd2-950a-2ec0057b23af",
  "score": "4:20",
  "rx": true,
  "created_at": "2020-05-28T11:32:08.962274+00:00",
  "updated_at": "2020-05-28T11:32:08.962274+00:00"
}

```

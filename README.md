# wodbook-api

Back-end for a CrossFit workout application

## Running

Building the docker image:

```sh
make build-docker
```

Run in docker:

```sh
docker-compose -f docker-compose.yml -f docker-compose.wodbook-api.yml up -d
```

## Usage

Listing my profile:

```sh
GET: http://localhost:43210/v1/me
{
    "data": {
        "firstName": "Egill"
        ...
    }
}
```

Posting a workout score:

```sh
POST: http://localhost:43210/v1/workouts/{id}
{
  "data": {
    "score": "TBD"
  }
}
```

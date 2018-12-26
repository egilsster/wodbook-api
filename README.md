# wodbook-api

[![CircleCI](https://circleci.com/gh/egilsster/wodbook-api/tree/master.svg?style=shield)](https://circleci.com/gh/egilsster/wodbook-api/tree/master)
[![Maintainability](https://api.codeclimate.com/v1/badges/9f204b79ad07c8a0344f/maintainability)](https://codeclimate.com/github/egilsster/wodbook-api/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/9f204b79ad07c8a0344f/test_coverage)](https://codeclimate.com/github/egilsster/wodbook-api/test_coverage)
[![Greenkeeper badge](https://badges.greenkeeper.io/egilsster/wodbook-api.svg)](https://greenkeeper.io/)

Back-end for a CrossFit workout application

## Running

Building the docker image:

```sh
make build-docker
```

Run in docker:

```sh
docker-compose -f docker-compose.deps.yml -f docker-compose.wodbook-api.yml up -d
```

## Usage

Listing my profile:

```sh
GET: http://localhost:43210/v1/me
{
    "firstName": "Egill"
    ...
}
```

Posting a workout score:

```sh
POST: http://localhost:43210/v1/workouts/{id}/scores
{
    "score": "TBD"
}
```

#!/bin/bash

compose_down() {
  docker-compose -f docker-compose.component-test.yml down -v
}

compose_up() {
  docker-compose -f docker-compose.component-test.yml up -d
}

run_tests() {
  # Cleanup on error and on exit
  trap "compose_down" EXIT

  # Make sure environment is clean
  compose_down

  # Setup
  make build-image
  yarn --frozen-lockfile
  compose_up

  # Run tests
  yarn component-test
}

run_tests

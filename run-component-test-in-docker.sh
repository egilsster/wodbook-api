#!/bin/bash

# TODO(egilsster): make script work with Rust implementation of the api

echo latest > ./version.txt
VER=latest docker-compose -f docker-compose.component-test.yml down -v
make build-ci
make build-test-image
VER=latest docker-compose -f docker-compose.component-test.yml run sut

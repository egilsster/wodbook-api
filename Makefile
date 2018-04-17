SERVICE_NAME = wodbook-api

MOD_BIN = ./node_modules/.bin
DEPCHECK = $(MOD_BIN)/depcheck
CODECLIMATE = $(MOD_BIN)/codeclimate-test-reporter

VER ?= latest

build-image:
	docker build -f Dockerfile.multi -t $(SERVICE_NAME) --target production .

build-test-image:
	docker build -f Dockerfile.multi -t test-image --target test .

build-ci:
	$(MAKE) build-image
	docker tag $(SERVICE_NAME):latest $(SERVICE_NAME):$(shell cat ./version.txt)

test:
ifeq (,${CIRCLE_BUILD_NUM})
	$(MAKE) test-local
else
	$(MAKE) test-ci
endif

test-local:
	$(MAKE) check-security
	$(MAKE) depcheck
	$(MAKE) lint
	npm test

test-ci:
	$(MAKE) check-security
	$(MAKE) depcheck
	$(MAKE) lint
	npm run test:coverage
	$(CODECLIMATE) < coverage/lcov.info

depcheck:
	$(DEPCHECK) --ignores codeclimate-test-reporter,depcheck,tslint,nsp,ts-jest,request-promise,@types/*

check-security:
	$(MOD_BIN)/nsp check

lint:
	$(MOD_BIN)/tslint -p . -c tslint.json

# tell make to delete file targets on error
.DELETE_ON_ERROR:

# Make sure we overwrite files when building / rendering
.PHONY: build

SERVICE_NAME = wodbook-api

MOD_BIN = ./node_modules/.bin
DEPCHECK = $(MOD_BIN)/depcheck

VER ?= latest

build-image:
	docker build -t $(SERVICE_NAME) --target production .

build-test-image:
	docker build -t test-image --target test .

test:
	$(MAKE) check-security
	$(MAKE) depcheck
	$(MAKE) lint
	npm run test:coverage

depcheck:
	$(DEPCHECK) --ignores depcheck,tslint,nsp,ts-jest,@types/*

check-security:
	$(MOD_BIN)/nsp check

lint:
	$(MOD_BIN)/tslint -p . -c tslint.json

# tell make to delete file targets on error
.DELETE_ON_ERROR:

# Make sure we overwrite files when building / rendering
.PHONY: build

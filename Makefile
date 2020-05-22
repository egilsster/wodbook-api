SERVICE_NAME = wodbook-api
VER ?= latest

build-image:
	docker build -t $(SERVICE_NAME) .

# tell make to delete file targets on error
.DELETE_ON_ERROR:

# Overwrite files from these targets
.PHONY: build-image

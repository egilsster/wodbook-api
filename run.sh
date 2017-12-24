#!/bin/bash
export NODE_ENV=development
export MONGO_URI=mongodb://localhost:27017/wodbook
export MONGO_MAX_POOL_SIZE=10

npm run dev

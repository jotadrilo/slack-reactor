#!/bin/bash -e

# Install dependencies
npm install

# Run serverless
serverless "$@"

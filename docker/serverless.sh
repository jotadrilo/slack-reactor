#!/bin/bash -e

# Install dependencies
npm install

# Run serverless
cd lambda
serverless "$@"

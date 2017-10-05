#!/bin/bash -e

/app/docker/serverless.sh invoke local --function react --path "$CONFIG_FILE"

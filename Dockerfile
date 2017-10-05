FROM bitnami/node:6.10.3-r0

RUN npm install -g serverless@1.23.0
WORKDIR /app
COPY . /app

ENTRYPOINT ["/app/docker/entrypoint.sh"]
CMD ["/app/docker/slack-reactor.sh"]

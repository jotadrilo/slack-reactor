# slack-reactor
Simple Slack reactor is a tool that reacts to the latest Slack message matching a pattern.

It runs over Node and provides Lambda support.

## Prerequisites

You can either install:

 * Node `>6.9`.
 * Docker Engine `>1.10.0` and Docker Compose `>1.6.0`.

Also, you need a [Slack User Token](https://api.slack.com/docs/token-types#user). You can request a test API token through the [Legacy token generator](https://api.slack.com/custom-integrations/legacy-tokens).

Once you get it, you should replace the `<slack-api-token-here>` placeholder in some files to authenticate Slack:
 - `docker-compose.yml`
 - `lambda/serverless.yml`

Also, some commands in this documentation will refer to this placeholder instead of the real token, wich should follow the `xoxp-*` pattern.

## Local Run

You can run this tool either in a container or in your host machine.

### Host

You need to specify a configuration file and run:

```bash
node index.js config.yml
```

### Container

You need to specify a configuration file in the `docker-compose.yml` environment section and run:

```bash
docker-compose run \
  -e "CONFIG_FILE=/app/config.yml" \
  -e "SLACK_API_TOKEN=<slack-api-token-here>" \
  react
```

## Configuration file

Example of configuration file:

```yaml
sample:
  pattern: 'test passed'
  emojis:
    - '+1'
  notifications:
    - user: '@jhon'
      info: 'Just reacted with :{{emoji}}: in <{{permalink}}|#{{channel.name}}>!'
      alert: 'Unable to react with :{{emoji}}:!'
    - user: '@jane'
      info: 'Just reacted with :{{emoji}}: in <{{permalink}}|#{{channel.name}}>!'

```

### Details

 - `sample`: Event object name
 - `pattern`: Pattern to look messages for
 - `emojis`: Emoji list to react with
 - `notifications`: Notifications object
 - `notifications.user`: User to notify
 - `notifications.info`: Information message to notify with. It accepts handlebars, using the Slack Web API response as data
 - `notifications.alert`: Alert message to notify errors with. It also accepts handlebars.

## Lambda

This tool also supports Lambda. You need to have an AWS account already created and a `~/.aws/credentials` file populated.
In order to easy the Lambda function creation, we will use Serverless.

### Test

The Serverless function can be tested before being deployed to AWS Lambda. In order to do so, run:

```bash
docker-compose run \
  -e "CONFIG_FILE=/app/config.yml" \
  -e "SLACK_API_TOKEN=<slack-api-token-here>" \
  test
```

### Deploy

In order to deploy the Serverless function, run:

```bash
docker-compose run \
  -e "CONFIG_FILE=/app/config.yml" \
  -e "SLACK_API_TOKEN=<slack-api-token-here>" \
  deploy
```

### Serverless file

The important details in the `lambda/serverless.yml` file are:

```yaml
...

functions:
  react:
    ...
    events:
      - schedule:
          rate: cron(0 16 ? * MON-FRI *)
          input:
            sample:
              pattern: 'test passed'
              emojis:
                - '+1'
              notifications:
                - user: '@jhon'
                  info: 'Just reacted with :{{emoji}}: in <{{permalink}}|#{{channel.name}}>!'
                  alert: 'Unable to react with :{{emoji}}:!'
                - user: '@jane'
                  info: 'Just reacted with :{{emoji}}: in <{{permalink}}|#{{channel.name}}>!'
    environment:
      SLACK_API_TOKEN: '<slack-api-token-here>'
```

Where:

- `rate`: Cron expression to run the function
- `input`: Configuration YAML data (`config.yml`)
- `environment:`: `SLACK_API_TOKEN` should follow the `xoxp-*` pattern.

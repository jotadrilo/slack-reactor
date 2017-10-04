'use strict';

const WebClient = require('@slack/client').WebClient;
const _ = require('lodash');
const hb = require('handlebars');
const yaml = require('js-yaml');
const fs = require('fs');

// Parse input
const token = process.env.SLACK_API_TOKEN || '';
const configFile = process.argv[2] || '';
if (configFile === "") {
  console.error(`Please enter a configuration file\n`);
  throw new Error('Enter configuration file');
}

// Load configuration
let config = '';
try {
  config = yaml.safeLoad(fs.readFileSync(configFile, 'utf8'));
} catch (e) {
  console.error(`${configFile} file does not exist!\n`);
  throw(e);
}

// Instantiate Slack web client
const web = new WebClient(token);

// Process all the events
_.each(config, (c, n) => {
  const callbacks = {
    error: (data, info) => {
      _.each(c.notifications, (n) => {
        if (n.alert !== "") {
          var infoTpl = hb.compile(n.alert);
          var msg = `${infoTpl(data)}\n> *Error*:\n> \`\`\`${info}\`\`\``;
          web.chat.postMessage(n.user, msg);
        }
      });
    },
    success: (data) => {
      _.each(c.notifications, (n) => {
        if (n.info !== "") {
          var infoTpl = hb.compile(n.info);
          var msg = infoTpl(data);
          web.chat.postMessage(n.user, msg);
        }
      });
    },
  };

  web.search.messages(c.pattern, {count: 1}, (err, res) => {
    if (err) {
      callbacks.error(err);
    } else {
      const msg = res.messages.matches[0];
      _.each(c.emojis, (emoji) => {
        web.reactions.add(emoji, {
          timestamp: msg.ts,
          channel: msg.channel.id
        }, (err, res) => {
          var data = _.merge(msg, {emoji});
          if (err) {
            callbacks.error(data, err);
          } else {
            callbacks.success(data);
          }
        });
      });
    }
  });
});

'use strict';

const WebClient = require('@slack/client').WebClient;
const _ = require('lodash');
const hb = require('handlebars');
const yaml = require('js-yaml');
const fs = require('fs');

// Functions
const getCallbacks = (c) => {
  return {
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
};

const react = (c, callbacks) => {
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
};

// Instantiate Slack web client
const token = process.env.SLACK_API_TOKEN || '';
const web = new WebClient(token);

// Export serverless function
module.exports.react = (event, context, callback) => {
  console.log(JSON.stringify(event, null, 2));
  // Process all the events
  _.each(event, (config, name) => {
    console.log(`Processing event: ${name}`);
    const callbacks = getCallbacks(config);
    react(config, callbacks);
  });
};

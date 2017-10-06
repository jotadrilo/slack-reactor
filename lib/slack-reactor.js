'use strict';

const WebClient = require('@slack/client').WebClient;
const _ = require('lodash');
const hb = require('handlebars');
const yaml = require('js-yaml');
const fs = require('fs');

// Instantiate Slack web client
const token = process.env.SLACK_API_TOKEN || '';
const web = new WebClient(token);

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

const addReaction = (emoji, msg, callbacks) => {
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
};

const searchMsg = (c) => {
  const callbacks = getCallbacks(c);
  _.each(c.patterns, (pattern) => {
    web.search.messages(pattern, {count: 1}, (err, res) => {
      if (err) {
        callbacks.error(err);
      } else {
        const msg = res.messages.matches[0];
        _.each(c.emojis, (emoji) => addReaction(emoji, msg, callbacks));
      }
    });
  });
};

const react = (data) => {
  // Process all the events
  _.each(data, (config, name) => {
    console.log(`Processing event: ${name}`);
    searchMsg(config);
  });
};

// Export serverless function
module.exports.react = react;

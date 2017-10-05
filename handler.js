'use strict';

const sr = require('./lib/slack-reactor');

// Export serverless function
module.exports.react = (event, context, callback) => {
  console.log(JSON.stringify(event, null, 2));
  // Process all the events
  sr.react(event);
};

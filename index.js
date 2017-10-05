'use strict';

const yaml = require('js-yaml');
const fs = require('fs');
const sr = require('./lib/slack-reactor');

// Parse input
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

sr.react(config);

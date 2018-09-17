'use strict';

const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const util = require('./util');

const siteConfigRootDir = 'config';
const file = 'root.yml';
let config;

try {
  config = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '..', siteConfigRootDir, file), 'utf8'));
  console.log('site config "' + file + '" loaded.');
} catch (e) {
  console.error('site config "' + file + '" load failed.');
  console.error(e);
  process.exit(-1);
}

module.exports = config;

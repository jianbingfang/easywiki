'use strict';

const express = require('express');
const router = express.Router();
const siteConfig = require('../common/siteConfig.js');
const util = require('../common/util.js');

/* GET Configuration of site */
router.get('/', function (req, res, next) {
  let config = {};
  if (siteConfig) {
    const env = siteConfig.application.environment;
    const alias = util.getAliasFromReqestHeader(env, req.headers);
    console.log('current user: ' + alias);
    config = {
      'alias': alias,
      'isAdmin': util.isAdmin(siteConfig, alias),
      'application': siteConfig.application,
      'info': siteConfig.info,
      'tabs': siteConfig.tabs
    };
  }
  res.send(config);
});

module.exports = router;
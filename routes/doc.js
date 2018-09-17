'use strict';

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const util = require('../common/util');
const siteConfig = require('../common/siteConfig');

router.get('/:type/:name', function (req, res) {
  const type = req.params.type;
  const name = req.params.name;
  const filePath = path.join(__dirname, '..', siteConfig.application.docRoot, type, name);
  try {
    const content = util.getFileContent(filePath);
    let data;
    switch (type) {
      case 'table':
        data = util.mdtable2json(content);
        const env = siteConfig.application.environment;
        const alias = util.getAliasFromReqestHeader(env, req.headers);
        if (!util.isAdmin(alias)) {
          data.body = data.body.filter(v => v.Catagory !== 'Admin');
        }
        break;
      case 'releaseHistory':
        data = util.enrichReleaseHistory(content);
        break;
      default:
        data = content;
    }
    res.send({
      filename: name,
      type: type,
      content: data
    });
  } catch (e) {
    res.send({
      filename: name,
      type: type,
      error: e
    });
  }
});

module.exports = router;
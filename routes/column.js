'use strict';

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const util = require('../common/util');
const siteConfig = require('../common/siteConfig');

router.get('/:view?/:column', function (req, res) {
  const view = req.params.view || '';
  const column = req.params.column;
  const relativePath = path.join('column', view, `${column}.md`);
  const filePath = path.join(__dirname, '..', siteConfig.application.docRoot, relativePath);
  try {
    const md = util.getFileContent(filePath);
    const html = util.genDocEditButtons(siteConfig.application.repoAddr, siteConfig.application.branch, siteConfig.application.docRoot, relativePath) + util.md2html(md);
    res.send(html);
  } catch (e) {
    res.send(`<p><strong>ERROR:</strong> ${e.message}</p>`);
  }
});

module.exports = router;
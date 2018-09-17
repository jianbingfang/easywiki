'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const moment = require('moment');
const marked = require('marked');
const noncharacters = require('noncharacters');

const placeholder = {
  '\\|': noncharacters[0]
};

marked.setOptions({
  highlight: code => require('highlight.js').highlightAuto(code).value
});

const renderer = new marked.Renderer();
renderer.link = (href, title, text) => {
  title = title || '';
  if (href.length > 1 && href[0] === '#') {
    // if this is an anchor
    const anchor = escapeAnchor(href.substr(1));
    return '<a href="#' + anchor + '" title="' + title + '">' + text + '</a>';
  } else if (href.length > 1 && href[0] === '$') {
    // if this is an column reference
    const column = href.substr(1);
    return '<a href="javascript:void(0)" uib-popover-template="\'/api/column/' + column + '\'" popover-title="' + column + '" popover-class="column-popover" popover-placement="bottom-left">' + text + '</a>';
  } else {
    return '<a href="' + href + '" title="' + title + '" target="_blank">' + text + '</a>';
  }
}

renderer.image = (href, title, text) => {
  let sizeStr = '';
  if (title && title.indexOf('x') >= 0) {
    const sizeArr = title.trim().split('x');
    sizeStr += ' width="' + ((+sizeArr[0] > 0) ? sizeArr[0].trim() : 'auto') + '"';
    sizeStr += ' height="' + ((+sizeArr[1] > 0) ? sizeArr[1].trim() : 'auto') + '"';
  }
  return ('<img src="' + href + '" alt="' + text + '"' + sizeStr + '>');
}

exports.getAliasFromReqestHeader = (hostEnv, reqHeader) => {
  hostEnv = hostEnv || 'azure';
  reqHeader = reqHeader || {};
  let username;
  let alias = 'UNKNOWN';
  let spiltPos;
  switch (hostEnv.toLowerCase()) {
    case 'azure':
      username = reqHeader['x-ms-client-principal-name'] || 'UNKNOWN';
      spiltPos = username.indexOf('@');
      alias = (spiltPos >= 0 ? username.substr(0, spiltPos) : username);
      break;

    case 'iis':
    case 'iisnode':
      username = reqHeader['x-iisnode-auth_user'] || 'UNKNOWN';
      spiltPos = username.indexOf('\\');
      alias = (spiltPos >= 0 ? username.substr(spiltPos + 1) : username);
      break;
      
    default:
      break;
  }

  return alias;
}

exports.isAdmin = (config, username) => {
  if (!username) return true;
  if (config && config.admins && config.admins.length) {
    for (let i = 0; i < config.admins.length; i++) {
      if (config.admins[i].toLowerCase() === username.toLowerCase()) {
        return true;
      }
    }
  }
  return false;
}

exports.mdtable2json = (content, ch) => {
  const splitChar = ch || '|';
  const escapeSeq = '\\' + splitChar;
  const escaped = content.replace(escapeSeq, placeholder[splitChar]);
  const lines = escaped.split(/\r?\n/);
  const header = _.trim(lines[0], splitChar)
    .split(splitChar)
    .map(v => v.trim())
    .filter(v => v.length > 0)
    .map(v => v.replace(placeholder[splitChar], escapeSeq));
  const body = lines.slice(2)
    .filter(v => !_.isEmpty(v))
    .map(row => _.zipObject(
      header,
      _.trim(row, splitChar + ' ')
      .split(splitChar)
      .map(v => enrichMarkdownRef(v.trim().replace(placeholder[splitChar], escapeSeq)))
    ));

  return {
    header: header,
    body: body
  };
}

exports.enrichReleaseHistory = (content) => {
  let data = JSON.parse(content);
  data = _.sortBy(data, ['CheckInDate', 'ReleaseDate']);
  data = _.reverse(data);
  data = _.groupBy(data, v => v.ReleaseDate ? moment(v.ReleaseDate).format('MMM. YYYY') : '');
  return data;
}

exports.md2html = (md) => {
  return marked(md, {
    renderer: renderer
  });
}

exports.genDocEditButtons = (repoAddr, branch, docRoot, filename) => {
  const editButtons = [
    '<div class="popover-doc-manage-btn-group" style="margin-top: -37px;">',
    `<a href="${repoAddr}?path=${docRoot}/${filename}&version=GB${branch}&_a=contents" target="_blank">`,
    '<span class="mif-file-archive" title="View Source"></span>',
    '</a>',
    `<a href="${repoAddr}?path=${docRoot}/${filename}&version=GB${branch}&_a=history" target="_blank">`,
    '<span class="mif-history" title="View History"></span>',
    '</a>',
    `<a href="${repoAddr}?path=${docRoot}/${filename}&version=GB${branch}&_a=contents&editMode=true" target="_blank">`,
    '<span class="mif-pencil" title="Edit"></span>',
    '</a>',
    '</div>'
  ].join('');

  return editButtons;
}

const fileCache = new Map();
exports.getFileContent = (filePath) => {
  if (!fileCache.has(filePath)) {
    fileCache.set(filePath, fs.readFileSync(filePath, 'utf-8'));
  }

  return fileCache.get(filePath);
}

function enrichMarkdownRef(content) {
  const refPattern = /^#REF<(.+)>$/;
  const match = content.match(refPattern);
  if (match) {
    const filename = match[1];
    const siteConfig = require('../common/siteConfig.js');
    const filePath = path.join(__dirname, '..', siteConfig.application.docRoot, filename);
    let md;
    try {
      md = exports.getFileContent(filePath);
      return content + md.trim();
    } catch (e) {
      return `${content} **ERROR**: document "**${filename}**" is missing!`;
    }
  } else {
    return content;
  }
}
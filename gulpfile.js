'use strict';

const gulp = require('gulp');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const marked = require('marked');
const sanitizeHtml = require('sanitize-html');
const he = require('he');
const util = require('./common/util');

gulp.task('default', ['build:index']);

gulp.task('build:index', () => {
  let index = {};

  const siteConfig = require(path.join(__dirname, 'common', 'siteConfig.js'));
  const pageIndexDocTypes = ['markdown', 'html'];
  const hostSiteRoot = path.join(__dirname, '_site');
  const hostSitePrefix = 's/';
  const indexOutputPath = path.join(__dirname, 'public', 'js', 'index_all.json');

  // build internal site index
  if (fs.existsSync(hostSiteRoot)) {
    fs.readdirSync(hostSiteRoot).forEach(siteFolder => {
      const indexFilePath = path.join(hostSiteRoot, siteFolder, 'index.json');
      if (fs.existsSync(indexFilePath)) {
        const idx = require(indexFilePath);
        _.forEach(idx, (value, key) => {
          let newLink = hostSitePrefix + siteFolder + '/' + key;
          value.href = newLink;
          index[newLink] = value;
        });
        console.log(indexFilePath, 'built finished.');
      }
    });
    console.log('Internal site index built finished.');
  }

  const docRoot = path.join(__dirname, siteConfig.application.docRoot);
  // build wiki doc index
  const tabs = _.flatten(siteConfig.tabs.map(tab => tab.subtabs || tab));
  tabs.forEach(tab => {
    const idx = {};
    const pageIdx = genPageIndex(tab.name, tab.ref, tab.docs);
    idx[pageIdx.href] = pageIdx;
    index = _.assignIn(index, idx);
  });

  // build column table index
  const tableRoot = path.join(docRoot, 'table');
  if (fs.existsSync(tableRoot)) {
    fs.readdirSync(tableRoot).forEach(tableFile => {
      const tableIdx = genTableIndex(path.join(tableRoot, tableFile));
      index = _.assignIn(index, tableIdx);
    });
  }

  fs.writeFileSync(indexOutputPath, JSON.stringify(index, null, 2), 'utf-8');

  /************************************************************
   * help functions
   */
  function genPageIndex(tabName, tabRef, docs) {
    const pageIdx = {};
    pageIdx.title = tabName;
    pageIdx.href = tabRef;
    pageIdx.keywords = genPageKeywords(docs, pageIndexDocTypes);
    return pageIdx;
  }

  function genTableIndex(tableFilePath) {
    const tableIdx = {};
    const tableContent = util.getFileContent(tableFilePath);
    const tableJson = util.mdtable2json(tableContent);
    if (tableJson.body) {
      tableJson.body.forEach(col => {
        let idx = {};
        idx.title = `Column ${cleanMarkdownTags(col.Name)} - (${cleanMarkdownTags(col.Type)}) | ${siteConfig.application.siteName} View`;
        idx.href = `api/${getDetailRef(col.Detail)}`;
        idx.keywords = cleanMarkdownTags(getDetail(col.Detail));
        tableIdx[idx.href] = idx;
      });
    }
    return tableIdx;
  }

  function genPageKeywords(docs, allowTypes) {
    allowTypes = _.castArray(allowTypes);
    return docs.filter(doc => allowTypes.indexOf(doc.type) >= 0)
      .map(doc => getCleanWords(doc))
      .join(' ');
  }

  function getCleanWords(doc) {
    const content = util.getFileContent(path.join(docRoot, doc.type, doc.src));
    switch (doc.type) {
      case 'html':
        return cleanHtmlTags(content);
      case 'markdown':
        return cleanMarkdownTags(content);
      default:
        return '';
    }
  }

  function cleanMarkdownTags(md) {
    const html = marked(md);
    return cleanHtmlTags(html);
  }

  function cleanHtmlTags(html) {
    const cleanText = sanitizeHtml(html, {
      allowedTags: [],
      allowedAttributes: []
    });
    const decodedText = he.decode(cleanText).replace(/\s+/g, ' ').trim();
    return decodedText;
  }

  function getDetail(detail) {
    detail = detail || ''
    const match = detail.match(/#REF<(.+)>/);
    if (match) {
      return detail.substr(match[0].length);
    } else {
      return detail;
    }
  }

  function getDetailRef(detail) {
    detail = detail || ''
    const match = detail.match(/#REF<(.+)>/);
    if (match) {
      var ref = match[1];
      var end = ref.lastIndexOf('.');
      return ref.substr(0, end);
    } else {
      return null;
    }
  }
});
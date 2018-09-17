'use strict';

const express = require('express');
const router = express.Router();
const request = require('request');

router.get('/test', function (req, res) {
  const timestamp = Date.now();
  const url = `https://dmpipeline.redmond.corp.microsoft.com/logs/ieqsa/availability?cluster=cosmos09&date=2017-02-04&_=${timestamp}`;
  req.pipe(request(url)).pipe(res);
});

router.get('/:date/:cluster/:dataset', function (req, res) {
  const dataset = req.params.dataset;
  const cluster = req.params.cluster;
  const date = req.params.date;
  const timestamp = Date.now();
  const url = `https://dmpipeline.redmond.corp.microsoft.com/logs/${dataset}/availability?cluster=${cluster}&date=${date}&_=${timestamp}`;
  req.pipe(request(url)).pipe(res);
});

module.exports = router;
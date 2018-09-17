const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression');

const config = require('./routes/config');
const doc = require('./routes/doc');
const column = require('./routes/column');
const availability = require('./routes/availability');
const util = require('./common/util');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(compression());
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/s', express.static(path.join(__dirname, '_site')));
app.use('/resources', express.static(path.join(__dirname, 'resources')));
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));

const siteConfig = require('./common/siteConfig.js');
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    next();
  } else {
    const env = siteConfig.application.environment;
    const alias = util.getAliasFromReqestHeader(env, req.headers);
    res.render('content_bs', {
      alias: alias,
      siteName: siteConfig.application.siteName,
      logo: siteConfig.application.logo,
      banner: siteConfig.application.banner,
      ariaToken: siteConfig.application.ariaToken,
      enableSearch: siteConfig.application.enableSearch
    });
  }
});

// JSON API
app.use('/api/config', config);
app.use('/api/doc', doc);
app.use('/api/column', column);
app.use('/api/availability', availability);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

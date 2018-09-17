'use strict';

angular.module('app').config(function (appConfig) {
  if (personalLogger instanceof microsoft.applications.telemetry.Logger) {
    console.log('use personalLogger in banner.js.');
    _WIKI_GLOABAL.ariaLogger = personalLogger;
  }
});
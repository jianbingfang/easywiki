'use strict';

angular.module('app').config(function (appConfig) {
  var slapiWikiAriaToken = appConfig.application.ariaToken;
  if (!microsoft.applications.telemetry.LogManager.isInitialized()) {
    microsoft.applications.telemetry.LogManager.initialize(slapiWikiAriaToken);
  }
  console.log('New ariaLogger init.');
  _WIKI_GLOABAL.ariaLogger = new microsoft.applications.telemetry.Logger(slapiWikiAriaToken);
});
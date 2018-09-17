'use strict';

angular.module('app').controller('sidebarCtrl', function ($scope, $state, appConfig) {
  $scope.$state = $state;
  $scope.tabs = appConfig.tabs;
  $scope.isAdmin = appConfig.isAdmin;
  $scope.repoAddr = appConfig.application.repoAddr;
});
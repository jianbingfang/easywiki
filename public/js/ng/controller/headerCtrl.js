'use strict';

angular.module('app').controller('headerCtrl', ['$scope', '$rootScope', 'appConfig', 'appConfig',
  function ($scope, $rootScope, appConfig) {
    if (appConfig && appConfig.info) {
      $scope.info = appConfig.info;
      $scope.isAdmin = appConfig.isAdmin;
      $scope.repoAddr = appConfig.application.repoAddr;
      $scope.enableSearch = appConfig.application.enableSearch;
      $scope.branch = appConfig.application.branch;
      $rootScope.pageTitle = appConfig.info.title || '';
    }

    $rootScope.search = {
      keyword: ''
    };
  }
]);
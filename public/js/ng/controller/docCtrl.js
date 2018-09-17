angular.module('app').controller('docCtrl', function ($scope, $rootScope, $filter,
  $stateParams, $location, appConfig, docService, lunrIndex, searchData) {
  'use strict';

  $scope.repoAddr = appConfig.application.repoAddr;
  $scope.docRoot = appConfig.application.docRoot;
  $scope.branch = appConfig.application.branch;
  $scope.hasBanner = appConfig.application.banner !== undefined;
  $scope.showContributeGuide = appConfig.application.showContributeGuide;

  $scope.docList = [];
  $scope.tableControl = [];
  // $scope.isAdmin = appConfig.isAdmin;
  $scope.isEditMode = false;
  $scope.numLimit = 10;

  $rootScope.$watch('search.keyword', function (keyword) {
    if (keyword && keyword.length > 2 && lunrIndex) {
      $scope.numLimit = 10;
      $rootScope.showSearchResult = true;
      var hits = lunrIndex.search(keyword);
      var results = [];
      hits.forEach(function (hit) {
        var item = searchData.index[hit.ref];
        results.push({
          href: item.href,
          title: item.title,
          keywords: item.keywords,
          type: getSearchResultType(item)
        });
      });
      $rootScope.search.hits = results;
      _WIKI_GLOABAL.ariaLogger.logEvent({
        name: "search_event",
        properties: [{
          key: "User",
          value: appConfig.alias
        }, {
          key: "Query",
          value: keyword
        }, {
          key: "Hits",
          value: results.length
        }]
      });
    } else {
      $rootScope.showSearchResult = false;
    }
  });

  var splitWordsWithSpaceFilter = $filter('splitWordsWithSpace');
  $scope.isNoSearchSuggestion = function() {
    return $rootScope.search.keyword === splitWordsWithSpaceFilter($rootScope.search.keyword);
  }

  $scope.reSearchKeyword = function() {
    $rootScope.search.keyword = splitWordsWithSpaceFilter($rootScope.search.keyword);
  }

  function getSearchResultType(item) {
    if (item.title.indexOf('Column') === 0) {
      return 'column';
    } else {
      return 'page';
    }
  }

  function isNoValueMap(map) {
    map = map || {};
    for (var key in map) {
      if (map.hasOwnProperty(key)) {
        if (map[key]) {
          return true;
        }
      }
    }
    return false;
  };

  var docCount = $stateParams.docs.length;
  var finished = 0;
  angular.forEach($stateParams.docs, function (doc, i) {
    docService.getDoc(doc.src, doc.type)
      .then(function (data) {
        $scope.docList[i] = data;
        if ($scope.docList[i].type === 'table') {
          $scope.tableControl[i] = docService.getDefaultTableControl($scope.docList[i].content, doc.pageSize, i);
        }
        updateProgress(++finished, docCount);
      }, function (msg) {
        updateProgress(++finished, docCount);
        $scope.docList[i] = null;
        toastr.error(doc.src, "File load failed.");
        console.error("[" + doc.src + "] load failed.");
      });
  });

  function updateProgress(finishedCount, totalCount) {
    if (finishedCount === totalCount) {
      $rootScope.progressbar.complete();
      setTimeout(function () {
        highlightKeywords($stateParams.q);
      }, 1000);
    } else {
      $rootScope.progressbar.set(100 * (finishedCount / totalCount));
    }
  }

  function highlightKeywords(keyword) {
    if (keyword && typeof Mark === 'function') {
      var content = new Mark(document.querySelector("div.doc-content-wrapper"));
      if (content) {
        content.mark(keyword, {
          separateWordSearch: true
        });
      }
    }
  }
});
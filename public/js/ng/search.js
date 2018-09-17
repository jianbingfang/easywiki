'use strict';
// full-text-search
angular.module('app').value('searchData', {});

angular.module('app').run(function ($http, lunrIndex, searchData) {
  if (lunrIndex) {
    $http.get('js/index_all.json')
      .then(function (resp) {
        searchData.index = resp.data;
        for (var prop in searchData.index) {
          lunrIndex.add(searchData.index[prop]);
        }
      }, function (err) {
        console.error("Get index.json failed.");
      });

    $http.get('js/search-stopwords.json')
      .then(function (resp) {
        var stopWords = resp.data;
        var docfxStopWordFilter = lunr.generateStopWordFilter(stopWords);
        lunr.Pipeline.registerFunction(docfxStopWordFilter, 'docfxStopWordFilter');
        lunrIndex.pipeline.add(docfxStopWordFilter);
      }, function (err) {
        console.error("Get search-stopwords.json failed.");
      });
  }
});
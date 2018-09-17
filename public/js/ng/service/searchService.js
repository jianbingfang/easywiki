'use strict';

angular.module('app').factory('lunrIndex', function lunrIndexFactory() {
  var lunrIndex = null;
  if (typeof lunr === 'function') {
    lunrIndex = lunr(function () {
      console.log('lunrIndex init.');
      this.ref('href');
      this.field('title', {
        boost: 50
      });
      this.field('keywords', {
        boost: 20
      });
    });

    lunr.tokenizer.seperator = /[\s\-\.]+/;
  }

  return lunrIndex;
});
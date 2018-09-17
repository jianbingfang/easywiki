'use strict';

angular.module('app').filter('md2html', ['marked', function (marked) {
  var filter = function (md) {
    return marked(md);
  };

  return filter;
}]);

angular.module('app').filter('trustAsHtml', ['$sce', function ($sce) {
  return function (text) {
    return $sce.trustAsHtml(text);
  };
}]);

angular.module('app').filter('extractContentBrief', function () {
  return function (content, query) {
    var briefOffset = 512;
    var words = query.split(/\s+/g);
    var queryIndex = content.indexOf(words[0]);
    var briefContent;
    if (queryIndex > briefOffset) {
      return "..." + content.slice(queryIndex - briefOffset, queryIndex + briefOffset) + "...";
    } else if (queryIndex <= briefOffset) {
      return content.slice(0, queryIndex + briefOffset) + "...";
    }
  };
});

angular.module('app').filter('toAbsoluteUrl', function () {
  return function (relativeUrl) {
    return document.location.protocol + '//' + window.location.host + '/' + relativeUrl;
  };
});

angular.module('app').filter('highlightKeyword', ['$sce', function ($sce) {
  function escapeHtmlTag(str) {
    var entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;'
    };

    return String(str).replace(/[&<>\/]/g, function (s) {
      return entityMap[s];
    });
  }

  function escapeRegexChar(text) {
    text = text || '';
    return text.replace(/([\.\$\^\{\[\(\|\)\*\+\?\\])/gm, '\\$1');
  }

  return function (content, keyword) {
    var words = keyword.split(/\s+/g);
    content = escapeHtmlTag(content);
    try {
      var reg;
      for (var i = 0; i < words.length; i++) {
        reg = new RegExp('(' + escapeRegexChar(words[i]) + ')', 'igm');
        content = content.replace(reg, '<div class="highlight-keyword">$1</div>');
      }
      return content;
    } catch (e) {
      console.error(e);
      return content;
    }
  };
}]);

angular.module('app').filter('splitWordsWithSpace', function () {
  return function (text) {
    text = text || '';
    return text.split(/[^A-Za-z0-9]/)
      .filter(function(v) {return v})
      .join(' ')
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/([A-Z0-9]+)([A-Z][a-z])/g, '$1 $2');
  };
});
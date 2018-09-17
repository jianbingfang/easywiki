'use strict';

var _WIKI_GLOABAL = {
  ariaLogger: undefined
};

window.deferredBootstrapper.bootstrap({
  element: document.body,
  module: 'app',
  sanitize: true,
  resolve: {
    appConfig: function ($http) {
      return $http.get('api/config');
    }
  },
  onError: function (error) {
    console.error(error);
  }
});

angular.module('app', ['ngSanitize', 'ui.router', 'ui.bootstrap', 'hc.marked', 'ngProgress', 'bsTable']);

angular.module('app').config(['appConfig', '$stateProvider', '$urlRouterProvider', '$locationProvider',
  function (appConfig, $stateProvider, $urlRouterProvider, $locationProvider) {
    console.log(appConfig);
    var alias = appConfig.alias;
    var site = appConfig.application.siteName;
    var tabs = appConfig.tabs;

    function initState(state, params) {
      angular.merge(params, {
        q: {
          squash: true
        }
      });

      $stateProvider.state(state, {
        url: '/' + state + '?q',
        params: params,
        controller: 'docCtrl',
        templateUrl: '/views/content.html',
        onEnter: function ($stateParams) {
          console.log('Enter: ' + state);
          if (_WIKI_GLOABAL.ariaLogger instanceof microsoft.applications.telemetry.Logger) {
            _WIKI_GLOABAL.ariaLogger.logEvent({
              name: "page_load_event",
              properties: [{
                key: "User",
                value: alias
              }, {
                key: "PageLink",
                value: state
              }, {
                key: "QParam",
                value: $stateParams.q
              }]
            });
          }
        }
      });
    }

    angular.forEach(tabs, function (tab, i) {
      if (tab.subtabs) {
        angular.forEach(tab.subtabs, function (subtab, j) {
          var ref = subtab.ref || subtab.name.toLowerCase().replace(/[^0-9a-z\u4e00-\u9fa5]+/g, "-");
          // var ref = subtab.ref;
          if (i === 0 && j === 0) {
            $urlRouterProvider.otherwise(ref);
          }

          initState(ref, {
            docs: subtab.docs
          });
        });
      } else {
        var ref = tab.ref || tab.name.toLowerCase().replace(/[^0-9a-z\u4e00-\u9fa5]+/g, "-");
        // var ref = tab.ref;
        if (i === 0) {
          $urlRouterProvider.otherwise(ref);
        }

        initState(ref, {
          docs: tab.docs
        });
      }
    });

    $locationProvider.html5Mode(true);
  }
]);

angular.module('app').config(['markedProvider', function (markedProvider) {
  markedProvider.setOptions({
    gfm: true,
    tables: true,
    highlight: function (code, lang) {
      if (lang) {
        return hljs.highlight(lang, code, true).value;
      } else {
        return hljs.highlightAuto(code).value;
      }
    }
  });

  function escapeAnchor(anchor) {
    anchor = anchor || '';
    return anchor.replace(/<[^>]+>/gm, '').toLowerCase().replace(/[^\w]+/g, '-');
  }

  markedProvider.setRenderer({
    table: function (header, body) {
      return '<table data-toggle="table" class="table table-striped">' + header + body + '</table>'
    },
    link: function (href, title, text) {
      title = title || '';
      if (href.length > 1 && href[0] === '#') {
        // if this is an anchor
        var anchor = escapeAnchor(href.substr(1));
        return '<a href="#' + anchor + '" title="' + title + '">' + text + '</a>';
      } else if (href.length > 1 && href[0] === '$') {
        // if this is an column reference
        var column = href.substr(1);
        return '<a href="javascript:void(0)" uib-popover-template="\'api/column/' + column + '\'" popover-title="' + column + '" popover-class="column-popover" popover-placement="bottom-left" popover-append-to-body="true">' + text + '</a>';
      } else {
        return '<a href="' + href + '" title="' + title + '" target="_blank">' + text + '</a>';
      }
    },
    heading: function (text, level) {
      var escapedText = escapeAnchor(text);
      return [
        '<h' + level + '>',
        '<a id="anchor-' + escapedText + '" name="' + escapedText + '" class="anchor" href="#' + escapedText + '">',
        '<span class="header-link"></span>',
        '</a>',
        text,
        '</h' + level + '>'
      ].join('');
    },
    image: function (href, title, text) {
      var sizeStr = '';
      if (title && title.indexOf('x') >= 0) {
        var sizeArr = title.trim().split('x');
        sizeStr += ' width="' + ((+sizeArr[0] > 0) ? sizeArr[0].trim() : 'auto') + '"';
        sizeStr += ' height="' + ((+sizeArr[1] > 0) ? sizeArr[1].trim() : 'auto') + '"';
      }
      return ('<img src="' + href + '" alt="' + text + '"' + sizeStr + '>');
    }
  });
}]);

angular.module('app').config(['$qProvider', function ($qProvider) {
  $qProvider.errorOnUnhandledRejections(false);
}]);

angular.module('app').run(function ($rootScope, ngProgressFactory) {
  $rootScope.progressbar = ngProgressFactory.createInstance();
  var p = document.getElementById('dvBanner');
  if (p) {
    $rootScope.progressbar.setParent(p);
    $rootScope.progressbar.setHeight('2.5px');
    $rootScope.progressbar.getDomElement().css('position', 'relative');
  }

  $rootScope.$on('$viewContentLoading', function (event, viewConfig) {
    if ($rootScope.progressbar.status() === 0) {
      $rootScope.progressbar.set(10);
    }
  });

  $rootScope.$on('$viewContentLoaded', function (event, viewConfig) {
    // $rootScope.progressbar.complete();
  });
});

angular.module('app').run(['$state', function ($state) {}]);
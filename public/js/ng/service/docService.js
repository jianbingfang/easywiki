'use strict';

angular.module('app').service('docService', ['$rootScope', '$q', '$http', '$compile', 'appConfig', 'marked', function ($rootScope, $q, $http, $compile, appConfig, marked) {
  this.getDoc = function (docName, type) {
    var deferred = $q.defer();
    console.time('getDoc');
    $http.get('api/doc/' + type + '/' + docName)
      .then(function (resp) {
        console.timeEnd('getDoc');
        deferred.resolve(resp.data);
      }, function (err) {
        console.timeEnd('getDoc');
        deferred.reject(err);
      });
    return deferred.promise;
  };

  this.getDefaultTableControl = function (table, pageSize, docSeq) {
    var groupField = 'Group';
    var detailField = 'Detail';
    var data = table.body;
    var cols = table.header.concat('Description')
      .filter(function (col) {
        return col !== groupField && col !== detailField;
      })
      .map(function (col) {
        return {
          field: col,
          title: col,
          sortable: col !== 'Description',
          formatter: col === 'Description' ? descriptionFormatter : cellFormatter
        }
      });

    for (var i = 0; i < data.length; i++) {
      data[i].id = [docSeq, i].join('#');
      enrichDescription(data, i);
    }

    var control = {
      options: {
        columns: cols,
        data: data,
        idField: 'id',
        classes: 'table-nowrap table-no-bordered ng-isolate-scope table',
        rowStyle: function (row, index) {
          return {
            classes: row[detailField] ? 'column-table-row' : 'column-table-row column-table-row-no-detail'
          };
        },
        cache: true,
        striped: true,
        pagination: true,
        pageSize: pageSize || 10,
        pageList: [10, 25, 50, 100, 200],
        search: true,
        minimumCountColumns: 2,
        groupBy: true,
        groupByField: 'Group',
        detailView: true,
        detailFormatter: detailFormatter,
        onClickRow: onRowClicked
      }
    }

    function cellFormatter(value, row, index) {
      return marked(value);
    }

    function descriptionFormatter(value, row, index) {
      return value;
    }

    function detailFormatter(index, row) {
      return $compile(row[detailField])($rootScope);
    }

    function onRowClicked(row, $element, field) {
      if (row[detailField]) {
        var table = $element.parent().parent();
        if ($element.next().is('tr.detail-view')) {
          table.bootstrapTable('collapseRow', $element.data('index'));
          $element.removeClass('expand');
          $element.find('.expand-icon').removeClass('glyphicon-minus').addClass('glyphicon-plus');
        } else {
          table.bootstrapTable('expandRow', $element.data('index'));
          $element.addClass('expand');
          $element.find('.expand-icon').removeClass('glyphicon-plus').addClass('glyphicon-minus');
        }
      }
    }

    function enrichDescription(data, i) {
      var detail = data[i][detailField];
      var descriptionHtml;
      var match = detail.match(/#REF<(.+)>/);
      if (match) {
        var filename = match[1];
        var md = detail.substr(match[0].length);
        var index = md.indexOf(' ', 70);
        if (index !== -1) {
          descriptionHtml = marked(md.substr(0, index) + ' ...');
          data[i][detailField] = genDetailPage(md, filename);
        } else {
          descriptionHtml = marked(md);
          data[i][detailField] = genDetailPage(md, filename);
        }
      } else {
        descriptionHtml = marked(detail);
        data[i][detailField] = genDetailPage(detail, filename);
      }

      data[i]['Description'] = [
        '<div class="row flex-align-center">',
        '  <i class="expand-icon glyphicon glyphicon-plus"></i>',
        '  <div class="">' + descriptionHtml + '</div>',
        '</div>'
      ].join('');
    }

    function genDetailPage(md, filename) {
      var repoAddr = appConfig.application.repoAddr;
      var docRoot = appConfig.application.docRoot;
      var branch = appConfig.application.branch;
      var upArrow = '<div class="arrow-up"></div>';
      var editButtons = [
        '<div class="doc-manage-btn-group">',
        '<a href="' + repoAddr + '?path=' + docRoot + '/' + filename + '&version=GB' + branch + '&_a=contents" target="_blank">',
        '<span class="mif-file-archive" data-role="hint" data-hint-background="bg-green" data-hint-color="fg-white" data-hint-mode="2"',
        'data-hint="|View Source"></span>',
        '</a>',
        '<a href="' + repoAddr + '?path=' + docRoot + '/' + filename + '&version=GB' + branch + '&_a=history" target="_blank">',
        '<span class="mif-history" data-role="hint" data-hint-background="bg-green" data-hint-color="fg-white" data-hint-mode="2"',
        'data-hint="|View History"></span>',
        '</a>',
        '<a href="' + repoAddr + '?path=' + docRoot + '/' + filename + '&version=GB' + branch + '&_a=contents&editMode=true" target="_blank">',
        '<span class="mif-pencil" data-role="hint" data-hint-background="bg-green" data-hint-color="fg-white" data-hint-mode="2" data-hint="|Edit"></span>',
        '</a>',
        '</div>'
      ].join('');

      return [
        upArrow,
        '<div class="doc-manage-btn-group-wrapper">',
        editButtons,
        marked(md),
        '</div>'
      ].join('');
    }

    return control;
  }
}]);
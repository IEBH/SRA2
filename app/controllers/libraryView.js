/**
* Load references belonging to a library
* NOTE: Requires nesting within a controller that provides $scope.library
*/
app.controller('libraryViewController', function($scope, $loader, $location, $q, $rootScope, $stateParams, $window, References, Settings, Tasks) {
	$scope.grid = {
		data: [],
		totalItems: null,
		itemsSelected: null,

		// Columns {{{
		columnDefs: [
			{
				name: 'title',
				cellTemplate: `<div class="clickable ui-grid-cell-contents" ng-click="grid.appScope.openRef(row.entity)" ng-bind="row.entity.title"></div>`,
			},
			{
				name: 'authors',
				cellTemplate: `
					<div class="clickable ui-grid-cell-contents" ng-click="grid.appScope.openRef(row.entity)">
						<span ng-repeat="author in row.entity.authors | limitTo:3 track by $index" class="badge badge-info">
							<i class="fa fa-user"></i>
							{{author}}
						</span>
						<span ng-if="row.entity.authors.length > 3" class="badge badge-default">
							<i class="fa fa-group"></i>
							+{{::row.entity.authors.length - 3}}
						</span>
						<em ng-if="!row.entity.authors || !row.entity.authors.length">none</em>
					</div>
				`,
			},
			{
				name: 'tags',
				cellTemplate: `
					<div class="clickable ui-grid-cell-contents" ng-click="grid.appScope.openRef(row.entity)">
						<span ng-repeat="tag in row.entity.tags" class="tag" style="background: {{tagsObj[tag].color}}">{{tagsObj[tag].title}}</span>
					</div>
				`,
				visible: false,
			},
		],
		// }}}

		// Pagination {{{
		paginationPageSizes: [25, 50, 100, 300, 1000],
		paginationPageSize: 100,
		paginationCurrentPage: 1,
		// }}}

		// Sorting {{{
		enableSorting: true,
		// }}}

		// Selection {{{
		multiSelect: true,
		enableFullRowSelection: false, // Disables click to select but enables checking the row via the left-side checkbox
		enableRowHeaderSelection: true,
		selectionRowHeaderWidth: 35,
		noUnselect: false,
		enableSelectAll: true,
		// }}}

		// Server side config {{{
		useExternalPagination: true,
		useExternalSorting: true,
		useExternalFiltering: true,
		// }}}

		onRegisterApi: function(gridApi) {
			$scope.gridApi = gridApi;

			// Filtering changes - refetch on changes {{{
			$scope.gridApi.core.on.sortChanged($scope, function(grid, sortColumns) {
				var sortBy =
				$scope.refreshReferences({
					sort: function() {
						var sortBy = sortColumns
							.filter(col => !! col.sort.direction)
							.map(col => (col.sort.direction == 'asc' ? '' : '-') + col.field);
						return sortBy.length ? sortBy : ['title'];
					}(),
				});
			});

			gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
				$scope.refreshReferences({
					skip: (newPage - 1) * pageSize,
					limit: pageSize,
				});
			});
			// }}}

			// Selection - keep track of totals {{{
			gridApi.selection.on.rowSelectionChanged($scope,function(row) {
				$scope.grid.itemsSelected = $scope.gridApi.selection.getSelectedCount();
			});

			gridApi.selection.on.rowSelectionChangedBatch($scope,function(rows) {
				$scope.grid.itemsSelected = $scope.gridApi.selection.getSelectedCount();
			});
			// }}}
		},
	};


	// Data refresher {{{
	$scope.refresh = function() {
		$loader.start($scope.$id);

		$q.all([
			// Count references
			References.count({
				library: $stateParams.id,
				status: 'active',
			}).$promise
				.then(data => $scope.grid.totalItems = data.count),

			// Fetch initial references
			$scope.refreshReferences(),
		])
			.finally(() => $loader.stop($scope.$id));
	};

	$scope.referenceFilters = {library: $stateParams.id, status: 'active', sort: 'title', skip: 0, limit: $scope.grid.paginationPageSize};
	$scope.refreshReferences = function(newFilters) {
		_.merge($scope.referenceFilters, newFilters);

		$loader.startBackground($scope.$id + '-refs');
		return References.query($scope.referenceFilters).$promise
			.then(data => $scope.grid.data = data)
			.finally(() => $loader.stop($scope.$id + '-refs'));
	};

	// Wait until library is ready to apply some other behaviours
	var unwatchLibrary = $scope.$watch('library.title', function() {
		if (!$scope.library || !$scope.library.title) return; // Not yet loaded

		// Show the tags column if the library has tags
		if ($scope.hasTags) $scope.gridApi.grid.columns.filter(c => c.field == 'tags')[0].showColumn();

		if ($scope.library.dedupeStatus == 'processing') {
			Tasks.pendingByLibrary({id: $scope.library._id}).$promise
				.then(tasks => {
					// One task - so allocate the task link to it
					if (tasks.length == 1) $scope.taskLink = '#/libraries/task/' + tasks[0]._id;
				});
		}

		unwatchLibrary();
	});
	// }}}

	// Link opening {{{
	$scope.refPopup = 0;
	$scope.openRef = function(ref) {
		_.castArray(ref)
			.forEach(ref => {
				$window.open('/#/libraries/' + $stateParams.id + '/ref/' + ref._id, 'ref' + $scope.refPopup++);
			});
	};
	// }}}

	// Selection operations {{{
	$scope.selectAction = function(what, operand) {
		switch (what) {
			case 'all':
				$scope.gridApi.selection.selectAllRows();
				break;
			case 'none':
				$scope.gridApi.selection.clearSelectedRows();
				break;
			case 'invert':
				$scope.grid.data.forEach(row => $scope.gridApi.selection.toggleRowSelection(row));
				break;
			case 'byTag':
				$scope.gridApi.selection.clearSelectedRows();

				$scope.grid.data
					.filter(row => _.includes(row.tags, operand._id))
					.forEach(row => $scope.gridApi.selection.selectRow(row))

				break;
			case 'byNoTag':
				$scope.gridApi.selection.clearSelectedRows();

				$scope.grid.data
					.filter(row => !row.tags.length)
					.forEach(row => $scope.gridApi.selection.selectRow(row))
				break;
			case 'open':
				$scope.openRef($scope.gridApi.selection.getSelectedRows());
				break;
			case 'tag':
				if ($scope.gridApi.selection.getSelectedRows().every(row => _.includes(row.tags, operand._id))) { // Are we untagging?
					$scope.gridApi.selection.getSelectedRows()
						.forEach(row => row.tags = _.without(row.tags, operand._id));
				} else { // Tagging
					$scope.gridApi.selection.getSelectedRows()
						.filter(row => _.includes(row.tags, operand._id)) // Doesn't already have the tag
						.forEach(row => row.tags.push(operand._id));
				}

				// Save everything
				$scope.gridApi.selection.getSelectedRows()
					.forEach(row => References.save({id: row._id}, {tags: row.tags}))

				break;
			case 'tag-clear':
				$scope.gridApi.selection.getSelectedRows()
					.forEach(function(row) {
						row.tags = [];
						References.save({id: row._id}, {tags: row.tags});
					});
				break;
			case 'export': // Operation -> Export
				$rootScope.$broadcast('referenceBucket', $scope.gridApi.selection.getSelectedRows().map(r => r._id));
				$location.path('/libraries/' + $scope.library._id + '/export');
				break;
			case 'request': // Operation -> Journal request
				$rootScope.$broadcast('referenceBucket', $scope.gridApi.selection.getSelectedRows().map(r => r._id));
				$location.path('/libraries/' + $scope.library._id + '/request');
				break;
			case 'dedupe': // Operation -> Dedupe
				$rootScope.$broadcast('referenceBucket', $scope.gridApi.selection.getSelectedRows().map(r => r._id));
				$location.path('/libraries/' + $scope.library._id + '/dedupe');
				break;
			case 'screen': // Operation -> Screen
				$rootScope.$broadcast('referenceBucket', $scope.gridApi.selection.getSelectedRows().map(r => r._id));
				$location.path('/libraries/' + $scope.library._id + '/screen');
				break;
			case 'word-freq': // Operation -> Word-freq
				$rootScope.$broadcast('referenceBucket', $scope.gridApi.selection.getSelectedRows().map(r => r._id));
				$location.path('/libraries/' + $scope.library._id + '/word-freq');
				break;
			case 'delete':
				$scope.gridApi.selection.getSelectedRows()
					.forEach(function(row) {
						References.save({id: row._id}, {status: 'deleted'}).$promise
							.then($scope.refresh)
							.then($scope.gridApi.selection.clearSelectedRows());
					});
				break;
		}
	};
	// }}}

	// Reference editing {{{
	$scope.reference = null;

	$scope.editTags = function(reference) {
		$scope.reference = reference;
		$('#modal-tagEdit').modal('show');
	};

	$scope.toggleTag = function(tag) {
		var index = _.indexOf($scope.reference.tags, tag._id);
		if (index > -1) {
			$scope.reference.tags.splice(index, 1);
		} else {
			$scope.reference.tags.push(tag._id);
		}
	};

	$scope.saveReference = function() {
		References.save({id: $scope.reference._id}, _.pick($scope.reference, ['title', 'tags'])).$promise
			.then($scope.refresh);
	};

	$scope.openFullText = function(reference) {
		if ($scope.isFullTextDownloaded(reference)) {
			$window.open(reference.fullTextURL, '_blank');
		} else if (reference.fullTextURL) { // External link
			$window.open(reference.fullTextURL, '_blank');
		} else { // No link available - throw via OpenURL resolver
			var params = {
				'ctx_enc': 'info:ofi/enc:UTF-8',
				'ctx_id': '10_1',
				'ctx_tim': '2015-06-11T08%3A29%3A09IST',
				'ctx_ver': 'Z39.88-2004',
				'url_ctx_fmt': 'info:ofi/fmt:kev:mtx:ctx',
				'url_ver': 'Z39.88-2004',
				'rft.genre': 'article',
			};

			// Scan over reference fields and populate what we have into the search
			// Standards docs available at http://ocoins.info/cobg.html
			// See docs/alma-openurl-email.txt for reverse engineered splat
			_.forEach({
				title: 'rft.atitle',
				journal: 'rft.jtitle',
				volume: 'rft.volume',
				issue: 'rft.issue',
				issn: 'rft.isbn',
				pages: 'rft.pages',
				edition: 'rft.edition',
				// Unknown: rft.btitle, aulast, auinit, auinit1, auinitm, ausuffix, au, aucorp, date, part, quarter, ssn, pages, artnum, eissn, eisbn, sici, coden, pub, series, stitle, spage, epage
				// Unknown: rft_id, rft.object_id, rft_dat
			}, function(outField, inField) {
				if (reference[inField]) params[outField] = reference[inField];
			});
			$window.open('https://ap01.alma.exlibrisgroup.com/view/uresolver/61BOND_INST/openurl?' + $httpParamSerializer(params), '_blank');
		}
	};

	$scope.isFullTextDownloaded = function(reference) {
		return (/^\/api\/fulltext\//.test(reference.fullTextURL));
	};
	// }}}

	// Deal with breadcrumbs {{{
	$scope.$watch('library.title', ()=> {
		if (!$scope.library) return; // Not yet loaded
		$rootScope.$broadcast('setTitle', $scope.library.title);
	});
	// }}}

	$scope.$evalAsync($scope.refresh);
});

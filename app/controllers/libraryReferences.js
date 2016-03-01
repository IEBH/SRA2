/**
* Load references belonging to a library
* NOTE: Requires nesting within a controller that provides $scope.library
*/
app.controller('libraryReferencesController', function($scope, $filter, $httpParamSerializer, $location, $rootScope, $window, References, Settings) {
	$scope.references = null;
	
	// Data loading {{{
	$scope.$watch('library', function() {
		if (!$scope.library || !$scope.library._id) return;
		if (!$scope._initialLoad) {
			$scope.refreshReferences();
			$scope._initialLoad = true;
		}
	});

	$scope.refreshReferences = function() {
		$scope.references = [];
		$scope.refChunk = 0;
		$scope.loading = true;
		var loadingUnwatch = $scope.$watch('loading', () => {
			if ($scope.loading) return; // Still loading;
			$('#modal-loading').modal('hide') 
			loadingUnwatch();
		});
		$('#modal-loading').modal('show');
		$scope._refreshReferenceChunk();
	};

	/**
	* Load references in to the system in chunks (determined by Settings.getLimits.references)
	*/
	$scope._refreshReferenceChunk = function() {
		var rQuery = {
			library: $scope.library._id,
			status: 'active',
			limit: Settings.getLimits.references,
			skip: Settings.getLimits.references * $scope.refChunk,
		};
		if ($scope.activeTag && !$scope.activeTag.meta) rQuery.tags = $scope.activeTag._id;

		References.query(rQuery).$promise.then(function(data) {
			$scope.references = $scope.references.concat(
				data.map(ref => {
					// Decorators {{{
					// select already selected references (e.g. if changing tabs) {{{
					if (_.find($scope.selected, {_id: ref._id})) ref.selected = true;
					// }}}
					return ref;
					// }}}
				})
			);
			if ($scope.activeTag && $scope.activeTag.filter) { // Meta tag filtering
				$scope.references = $scope.references.filter($scope.activeTag.filter);
			}
			$scope.references = $filter('orderBy')($scope.references, $scope.sort, $scope.sortReverse);
			$scope.determineSelected();

			if (data.length < $scope.refChunk) { // Exhausted refs from server
				$scope.loading = false;
			} else {
				$scope.refChunk++;
				$scope.$evalAsync($scope._refreshReferenceChunk);
			}
		});
	};
	// }}}

	// Selected references {{{
	$scope.selected = [];
	/**
	* Called on each references.selected change to populate $scope.selected
	*/
	$scope.determineSelected = function() {
		$scope.selected = $scope.references.filter(ref => { return !! ref.selected });
	};

	$scope.selectAction = function(what, operand) {
		switch (what) {
			case 'all':
				$scope.references.forEach(ref => { ref.selected = true });
				break;
			case 'none':
				$scope.references.forEach(ref => { ref.selected = false });
				break;
			case 'invert':
				$scope.references.forEach(ref => { ref.selected = !ref.selected });
				break;
			case 'byTag':
				$scope.references.forEach(ref => {
					ref.selected = _.includes(ref.tags, operand._id);
				});
				break;
			case 'byNoTag':
				$scope.references.forEach(ref => {
					ref.selected = !ref.tags.length;
				});
				break;
			case 'tag':
				if ($scope.selected.every(ref => { return _.includes(ref.tags, operand._id) })) { // Are we untagging?
					$scope.selected.forEach(ref => {
						ref.tags = _.without(ref.tags, operand._id);
					});
				} else { // Tagging
					$scope.selected.forEach(ref => {
						if (!_.includes(ref.tags, operand._id)) ref.tags.push(operand._id);
					});
				}
				$scope.selected.forEach(ref => {
					References.save({id: ref._id}, {tags: ref.tags});
				});
				break;
			case 'tag-clear':
				$scope.selected.forEach(ref => {
					ref.tags = [];
					References.save({id: ref._id}, {tags: ref.tags});
				});
				break;
			case 'export': // Operation -> Export
				$rootScope.$broadcast('referenceBucket', $scope.selected.map(r => { return r._id }));
				$location.path('/libraries/' + $scope.library._id + '/export');
				break;
			case 'request': // Operation -> Journal request
				$rootScope.$broadcast('referenceBucket', $scope.selected.map(r => { return r._id }));
				$location.path('/libraries/' + $scope.library._id + '/request');
				break;
			case 'dedupe': // Operation -> Dedupe
				$rootScope.$broadcast('referenceBucket', $scope.selected.map(r => { return r._id }));
				$location.path('/libraries/' + $scope.library._id + '/dedupe');
				break;
			case 'screen': // Operation -> Screen
				$rootScope.$broadcast('referenceBucket', $scope.selected.map(r => { return r._id }));
				$location.path('/libraries/' + $scope.library._id + '/screen');
				break;
			case 'word-freq': // Operation -> Word-freq
				$rootScope.$broadcast('referenceBucket', $scope.selected.map(r => { return r._id }));
				$location.path('/libraries/' + $scope.library._id + '/word-freq');
				break;
			case 'delete':
				$scope.selected.forEach(ref => {
					ref.status = 'deleted';
					References.save({id: ref._id}, {status: ref.status});
				});
				break;
		}
		$scope.determineSelected();
	};
	// }}}

	// Sorting {{{
	$scope.sort = 'title';
	$scope.sortReverse = false;
	$scope.setSort = function(method) {
		if ($scope.sort == method) { // Already set - reverse method
			$scope.sortReverse = !$scope.sortReverse;
		} else if (method.substr(0, 1) == '-') { // Set into reverse
			$scope.sort = method.substr(1);
			$scope.sortReverse = true;
		} else { // Changing method
			$scope.sort = method;
			$scope.sortReverse = false;
		}
		$scope.references = $filter('orderBy')($scope.references, $scope.sort, $scope.sortReverse);
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
});

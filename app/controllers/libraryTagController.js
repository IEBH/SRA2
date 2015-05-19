app.controller('libraryTagController', function($scope, $debounce, collectionAssistant, Settings, References, ReferenceTags) {
	$scope.tags = null;
	$scope.loading = true;
	$scope.$watch('library', function() {
		if (!$scope.library) return;
		ReferenceTags.query({library: $scope.library._id}).$promise.then(function(data) {
			$scope.tags = data
				// Decorators {{{
				// .referenceCount {{{
				.map(function(tag) {
					tag.referenceCount = null;
					References.count({library: $scope.library._id, tags: tag._id}).$promise.then(function(countData) {
						tag.referenceCount = countData.count;
					});
					return tag;
				});
				// }}}
				// }}}
				$scope.loading = false;
		});
	});

	// Auto Save {{{
	$scope.$watch('tags', function(newTags, oldTags) {
		if ($scope.loading) return;
		collectionAssistant(newTags, oldTags)
			.indexBy('_id')
			.deepComparison()
			.on('update', function(item, oldItem) {
				// Only care about certain fields
				if (['title', 'color'].some(function(f) { console.log('CMP', item[f], '!=', oldItem[f]); if (item[f] != oldItem[f]) return true })) {
					$scope.saveTag(item);
				}
			});
	}, true);

	$scope.saveTag = $debounce(function(tag) {
		ReferenceTags.save({id: tag._id}, _.pick(tag, ['title', 'color']));
	}, Settings.debounce.tags);
	// }}}
});

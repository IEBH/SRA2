app.controller('libraryTagController', function($scope, $debounce, collectionAssistant, Settings, References, ReferenceTags) {
	$scope.tags = null;
	$scope.loading = true;
	$scope.$watch('library', function() {
		if (!$scope.library) return;
		$scope.refresh();
	});

	// Data refresher {{{
	$scope.refresh = function() {
		ReferenceTags.query({
			library: $scope.library._id,
			status: 'active',
			sort: 'title'
		}).$promise.then(function(data) {
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
		References.query({
			select: '_id,tags',
			library: $scope.library._id,
			status: 'active'
		}).$promise.then(function(data) {
			$scope.references = data;
		});
	};
	// }}}

	// References (used for Venn display) {{{
	$scope.references = null;

	// Prepare fast-access .tagLookup {{{
	$scope.tagLookup = null;
	$scope.$watch('tags', function() {
		if (!$scope.tags) return;
		$scope.tagLookup = {};
		$scope.tags.forEach(function(tag) { $scope.tagLookup[tag._id] = tag.title });
	});
	// }}}

	$scope.getReferenceTags = function(ref) {
		if (!$scope.tagLookup || !ref.tags) return [];
		return ref.tags.map(function(tag) {
			return $scope.tagLookup[tag];
		});
	};
	// }}}

	// Saver (automatic based on watch) {{{
	$scope.$watch('tags', function(newTags, oldTags) {
		if ($scope.loading) return;
		collectionAssistant(newTags, oldTags)
			.indexBy('_id')
			.deepComparison()
			.on('update', function(item, oldItem) {
				// Only save certain fields automatically
				if (['title', 'color'].some(function(f) { if (item[f] != oldItem[f]) return true })) {
					$scope.saveTag(item);
				}
			});
	}, true);

	$scope.saveTag = $debounce(function(tag) {
		ReferenceTags.save({id: tag._id}, _.pick(tag, ['title', 'color', 'status']));
	}, Settings.debounce.tags);
	// }}}

	$scope.deleteTag = function(tag) {
		tag.status = 'deleted';
		$scope.saveTag(tag);
	};

	$scope.newTag = function() {
		ReferenceTags.create({library: $scope.library._id}).$promise.then($scope.refresh);
	};
});

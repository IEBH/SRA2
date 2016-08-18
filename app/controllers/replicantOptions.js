app.controller('replicantOptionsController', function($scope, $location, $q, $stateParams, $rootScope, Loader, Replicant, TreeTools) {
	$scope.options = {
		grammar: undefined,
	};

	$scope.error;
	$scope.replicant;
	$scope.revman;
	$scope.grammars;

	$scope.refresh = function() {
		if (!$stateParams.id) return $location.path('/replicant');

		Loader
			.title('Retrieving RevMan file...')
			.start();

		$q.all([
			// Load in main replicant session object
			Replicant.get({id: $stateParams.id}).$promise
				.then(data => $scope.replicant = data),

			// Load main RevMan comparisons object
			Replicant.comparisons({id: $stateParams.id}).$promise
				.then(function(data) {
					$scope.revman = data.map(function(comparison, comparisonIndex) {
						comparison.selected = comparisonIndex < 3;
						if (comparison.subgroup) comparison.subgroup.forEach(subgroup => subgroup.selected = comparison.selected);
						if (comparison.study) comparison.study.forEach(study => study.selected = comparison.selected);
						return comparison;
					});
				})
				.catch(res => $scope.error = res.data.error),

			// Load Grammars list
			Replicant.grammars().$promise
				.then(data => $scope.grammars = data)
				.then(() => $scope.options.grammar = $scope.grammars[0].file),
		])
			.finally(() => Loader.finish())
	};

	$scope.submit = function() {
		$scope.options.primary = [];
		$scope.revman.forEach(function(comparison) {
			if (comparison.selected) $scope.options.primary.push(comparison.id);
			comparison.outcome.forEach(function(outcome) {
				if (outcome.selected) $scope.options.primary.push(outcome.id);
				if (outcome.subgroup) {
					outcome.subgroup.forEach(function(subgroup) {
						if (subgroup.selected) $scope.options.primary.push(subgroup.id);
					});
				}

				if (outcome.study) {
					outcome.study.forEach(function(study) {
						if (study.selected) $scope.options.primary.push(study.id);
					});
				}
			});
		});

		Replicant.save({id: $stateParams.id}, $scope.options).$promise
			.then(data => $location.path(`/replicant/${data._id}/generate`))
			.finally(Loader.finish());
	};

	// .counts - count of studies, comparisons, subcomparisons {{{
	$scope.counts = {
		comparisons: undefined,
		outcomes: undefined,
		subgroups: undefined,
		studies: undefined,
		text: '',
	};
	$scope.$watch('revman', function() {
		if (!$scope.revman) return; // Object not yet loaded
		$scope.counts.comparisons = 0;
		$scope.counts.outcomes = 0;
		$scope.counts.studies = 0;
		$scope.counts.subgroups = 0;

		$scope.revman.forEach(function(comparison) {
			if (comparison.selected) $scope.counts.comparisons++;

			comparison.outcome.forEach(function(outcome) {
				if (outcome.selected) $scope.counts.outcomes++;

				if (outcome.subgroup) {
					outcome.subgroup.forEach(function(subgroup) {
						if (subgroup.selected) $scope.counts.subgroups++;
					});
				}

				if (outcome.study) {
					outcome.study.forEach(function(study) {
						if (study.selected) $scope.counts.studies++;
					});
				}
			});
		});

		$scope.counts.text = _([
			$scope.counts.comparisons + ' comparisons',
			$scope.counts.outcomes + ' outcomes',
			$scope.counts.subgroups + ' sub-groups',
			$scope.counts.studies + ' studies',
		])
			.filter()
			.join(', ');
	}, true);
	// }}}

	// Deal with breadcrumbs {{{
	$scope.$watch('replicant', function() {
		if (!$scope.replicant) return; // Not yet loaded
		$rootScope.$broadcast('setBreadcrumb', [
			{url: '/replicant', title: 'RevMan Replicant'},
		]);
		$rootScope.$broadcast('setTitle', $scope.replicant.title);
	});
	// }}}

	$scope.toggleNode = function(item) {
		if (!item.selected) { // Turning selection on
			// Iterate down all generations turning them all on
			TreeTools
				.findGenerations($scope.revman, {id: item.id}, {childNode: ['outcome', 'study', 'subgroup']})
				.forEach(node => node.selected = true);
		} else { // Turning selection off - just disable this one selection
			item.selected = false;
			TreeTools
				.findChildren(item, null, {childNode: ['outcome', 'study', 'subgroup']})
				.forEach(node => node.selected = false);
		}
	};

	$scope.$evalAsync($scope.refresh);
});

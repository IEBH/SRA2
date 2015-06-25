app.controller('PolyglotSearchController', function($scope) {
	$scope.query = '"Cushing Syndrome"[Mesh] OR Cushing OR Cushings OR Cushing’s OR Hypercortisolism\n\nAND\n\n "Hydrocortisone"[Mesh] OR Hydrocortisone OR Cortisol OR Epicortisol OR Cortifair OR\n\n Cortril\n\n AND\n\n "Urine"[Mesh] OR Urine OR Urinary\n\n AND\n\n "Saliva"[Mesh] OR Saliva OR Salivary\n\n AND\n\n "Diagnosis"[Mesh] OR Diagnosis OR Diagnoses OR Diagnostic OR Screening';

	// Search engines {{{
	$scope.engines = [
		{
			id: 'pubmed',
			title: 'PubMed Health',
			rewriter: function(q) { return q },
			linker: function(engine) {
				return {
					method: 'POST',
					action: 'https://www.ncbi.nlm.nih.gov/pubmed?' + $.param({term: engine.query}),
				};
			},
		},
		{
			id: 'cochrane',
			title: 'Cochrane',
			rewriter: function(q) { return q },
			linker: function(engine) {
				return {
					method: 'POST',
					action: 'http://onlinelibrary.wiley.com/cochranelibrary/search',
					fields: {
						'submitSearch': 'Go',
						'searchRows[0].searchCriterias[0].fieldRestriction': null,
						'searchRows[0].searchCriterias[0].term': engine.query,
						'searchRows[0].searchOptions.searchProducts': null,
						'searchRows[0].searchOptions.searchStatuses': null,
						'searchRows[0].searchOptions.searchType': 'All',
						'searchRows[0].searchOptions.publicationStartYear': null,
						'searchRows[0].searchOptions.publicationEndYear': null,
						'searchRows[0].searchOptions.disableAutoStemming': null,
						'searchRows[0].searchOptions.reviewGroupIds': null,
						'searchRows[0].searchOptions.onlinePublicationStartYear': null,
						'searchRows[0].searchOptions.onlinePublicationEndYear': null,
						'searchRows[0].searchOptions.onlinePublicationStartMonth': 0,
						'searchRows[0].searchOptions.onlinePublicationEndMonth': 0,
						'searchRows[0].searchOptions.dateType:pubAllYears': null,
						'searchRows[0].searchOptions.onlinePublicationLastNoOfMonths': 0,
						'searchRow.ordinal': 0,
						'hiddenFields.currentPage': 1,
						'hiddenFields.strategySortBy': 'last-modified-date;desc',
						'hiddenFields.showStrategies': 'false',
						'hiddenFields.containerId': null,
						'hiddenFields.etag': null,
						'hiddenFields.originalContainerId': null,
						'hiddenFields.searchFilters.filterByProduct:cochraneReviewsDoi': null,
						'hiddenFields.searchFilters.filterByIssue': 'all',
						'hiddenFields.searchFilters.filterByType': 'All',
						'hiddenFields.searchFilters.displayIssuesAndTypesFilters': 'true',
					}
				};
			},
		},
		{
			id: 'embase',
			title: 'Embase',
			rewriter: function(q) { return q },
		},
		{
			id: 'webofscience',
			title: 'Web of Science',
			rewriter: function(q) { return q },
		},
	];
	// }}}

	$scope.$watch('query', function() {
		$scope.engines.forEach(function(engine) {
			engine.query = engine.rewriter($scope.query);
		});
	});

	$scope.openEngine = function(engine) {
		var linker = engine.linker(engine);
		$('#engineForm').remove();
		$('<form id="engineForm" target="_blank" action="' + linker.action + '" method="' + linker.method + '" style="display: none"></form>').appendTo($('body'))
		_.forEach(linker.fields, (v, k) => {
			$('<input name="' + k + '"/>')
				.attr('value', v)
				.appendTo($('#engineForm'));
		});
		$('#engineForm').submit();
	};
});

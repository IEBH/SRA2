app.controller('PolyglotSearchController', function($scope) {
	$scope.query = '';

	// Examples functionality {{{
	$scope.examples = [
		{title: 'Failure of antibiotic prescribing for bacterial infections', query: '"Primary Health Care"[Mesh] OR Primary care OR Primary healthcare OR Family practice OR General practice\n\nAND\n\n"Treatment Failure"[Mesh] OR Treatment failure OR Treatment failures\n\nAND\n\n"Bacterial Infections"[Mesh] OR Bacteria OR Bacterial\n\nAND\n\n"Anti-Bacterial Agents"[Mesh] OR Antibacterial Agents OR Antibacterial Agent OR Antibiotics OR Antibiotic'},
		{title: 'Clinical prediction guides for whiplash', query: '"Neck"[Mesh] OR Neck OR Necks OR "Cervical Vertebrae"[Mesh] OR "Cervical Vertebrae" OR "Neck Muscles"[Mesh] OR "Neck Muscles" OR "Neck Injuries"[Mesh] OR "Whiplash Injuries"[Mesh] OR "Radiculopathy"[Mesh] OR "Neck Injuries" OR "Neck Injury" OR Whiplash OR Radiculopathies OR Radiculopathy\n\n AND\n\n "Pain"[Mesh] OR Pain OR Pains OR Aches OR Ache OR Sore\n\n AND\n\n "Decision Support Techniques"[Mesh] OR "Predictive Value of Tests"[Mesh] OR "Observer Variation"[Mesh] OR Decision Support OR Decision Aids OR Decision Aid OR Decision Analysis OR Decision Modeling OR Decision modelling OR Prediction OR Predictions OR Predictor OR Predicting OR Predicted'},
		{title: 'Prevalence of Thyroid Disease in Australia', query: '"Thyroid Diseases"[Mesh] OR "Thyroid diseases" OR "Thyroid disease" OR "Thyroid disorder" OR "Thyroid disorders" OR Goiter OR Goitre OR Hypothyroidism OR Hyperthyroidism OR Thyroiditis OR "Graves disease" OR Hyperthyroxinemia OR Thyrotoxicosis OR  "Thyroid dysgenesis" OR "Thyroid cancer" OR "Thyroid cancers" OR "Thyroid neoplasm" OR "Thyroid neoplasms" OR "Thyroid nodule" OR "Thyroid nodules" OR "Thyroid tumor" OR "Thyroid tumour" OR "Thyroid tumors" OR "Thyroid tumours" OR "Thyroid cyst" OR "Thyroid cysts" OR "Cancer of the thyroid"\n\n AND\n\n "Prevalence"[Mesh] OR "Epidemiology"[Mesh] OR "Prevalence" OR "Prevalences" OR Epidemiology OR Epidemiological\n\n AND\n\n "Australia"[Mesh] OR Australia OR Australian OR Australasian OR Australasia OR Queensland OR Victoria OR "New South Wales" OR "Northern Territory"'},
	];

	$scope.diseases = [
		{name: 'Flue', value: 'flu'},
		{name: 'Headache', value: 'headache'},
		{name: 'Sore throat', value: 'sorethroat'},
		{name: 'AIDS', value: 'aids'},
		{name: 'Cold', value: 'cold'}
	];

	$scope.$watch('queryObject', function(newValue, oldValue) {
		console.log(newValue);
		if (newValue){
			if (newValue.title){
				$scope.query = newValue.title;
			}else{
				$scope.query = newValue.originalObject;
			}
		}
	});

	$scope.example = null;

	$scope.showExample = function() {
		var lastTitle = $scope.example ? $scope.example.title : null;
		do {
			$scope.example = _.sample($scope.examples);
		} while ($scope.example.title == lastTitle);
		$scope.query = _.clone($scope.example.query);
	};
	// }}}

	// Utility functions {{{
	$scope._replaceJunk = function(q) {
		return q.replace(/[“”«»„’']/g, '"');
	};

	/**
	* Wrap all non-logical non-empty lines in brackets
	* @param string query The input query to wrap
	* @return string The output query wrapped with brackets
	*/
	$scope._wrapLines = function(q) {
		return q.split("\n").map(function(line) {
			line = _.trim(line);
			if (!line) return line; // Empty line
			if (/^(AND|OR)$/i.test(line)) return line; // Logical line - dont wrap
			return '(' + line + ')';
		}).join("\n");
	};
	// }}}

	// Search engines {{{
	$scope.engines = [
		{
			id: 'pubmed',
			title: 'PubMed',
			rewriter: function(q) { 
				return $scope._replaceJunk($scope._wrapLines(q));
			},
			linker: function(engine) {
				return {
					method: 'GET',
					action: 'https://www.ncbi.nlm.nih.gov/pubmed',
					fields: {
						term: engine.query,
					},
				};
			},
		},
		{
			id: 'cochrane',
			title: 'Cochrane CENTRAL',
			rewriter: function(q) { 
				return $scope._replaceJunk($scope._wrapLines(q))
					.replace(/"(.+?)"\[MESH\]/ig, (line, mesh) => {
						return '[mh "' + mesh + '"]';
					});
			},
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
			rewriter: function(q) { 
				return $scope._replaceJunk($scope._wrapLines(q))
					.replace("'", '')
					.replace(/"(.+?)"\[MESH\]/ig, (line, mesh) => {
						return "'" + mesh + "'/exp";
					});
			},
			linker: function(engine) {
				return {
					method: 'POST',
					action: 'http://www.embase.com.ezproxy.bond.edu.au/rest/searchresults/executeSearch',
					fields: {
						module: 'SubmitQuery',
						search_type: 'advanced',
						search_action: 'search',
						rand: Math.random() * 999999,
						search_query: engine.query,
						tico_scope: 'doc',
						search_startyear: 2011,
						search_endyear: (new Date).getYear(),
						yearsAll: 'on'
					},
				};
			},
		},
		{
			id: 'webofscience',
			title: 'Web of Science',
			rewriter: function(q) { 
				return $scope._replaceJunk($scope._wrapLines(q))
					.replace(/"(.+?)"\[MESH\] (AND|OR) /ig, '')
					.replace(/"(.+?)"\[MESH\]/ig, '');
			},
			linker: function(engine) {
				return {
					method: 'POST',
					action: 'http://apps.webofknowledge.com.ezproxy.bond.edu.au/UA_GeneralSearch.do',
					fields: {
						fieldCount: '1',
						action: 'search',
						product: 'UA',
						search_mode: 'GeneralSearch',
						SID: 'W15WDD6M2xkKPbfGfGY',
						max_field_count: '25',
						max_field_notice: 'Notice: You cannot add another field.',
						input_invalid_notice: 'Search Error: Please enter a search term.',
						exp_notice: 'Search Error: Patent search term could be found in more than one family (unique patent number required for Expand option) ',
						input_invalid_notice_limits: ' <br/>Note: Fields displayed in scrolling boxes must be combined with at least one other search field.',
						sa_params: "UA||W15WDD6M2xkKPbfGfGY|http://apps.webofknowledge.com.ezproxy.bond.edu.au|'",
						formUpdated: 'true',
						'value(input1)': engine.query,
						'value(select1)': 'TS',
						x: '798',
						y: '311',
						'value(hidInput1)': null,
						limitStatus: 'collapsed',
						ss_lemmatization: 'On',
						ss_spellchecking: 'Suggest',
						SinceLastVisit_UTC: null,
						SinceLastVisit_DATE: null,
						period: 'Range Selection',
						range: 'ALL',
						startYear: '1900',
						endYear: (new Date()).getYear(),
						update_back2search_link_param: 'yes',
						ssStatus: 'display:none',
						ss_showsuggestions: 'ON',
						ss_query_language: 'auto',
						ss_numDefaultGeneralSearchFields: '1',
						rs_sort_by: 'PY.D;LD.D;SO.A;VL.D;PG.A;AU.A',
					},
				};
			},
		},
	];
	// }}}

	$scope.$watch('query', function() {
		$scope.engines.forEach(function(engine) {
			engine.query = engine.rewriter(_.clone($scope.query));
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

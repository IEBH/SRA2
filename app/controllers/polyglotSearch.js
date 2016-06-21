// Lodash extensions {{{
_.mixin({
	/**
	* Wrap all non-logical non-empty lines in brackets
	* @param string q The input query to wrap
	* @return string The output query wrapped with brackets
	*/
	wrapLines: function(q) { 
		return q.split("\n").map(function(line) {
			line = _.trim(line);
			if (!line) return line; // Empty line
			if (/^(AND|OR)$/i.test(line)) return line; // Logical line - dont wrap
			return '(' + line + ')';
		}).join("\n");
	},

	/**
	* Replace UTF8 weirdness with speachmarks
	* @param string q The input query to replace
	* @return string The cleaned up query
	*/
	replaceJunk: function(q) {
		return q.replace(/[“”«»„’']/g, '"');
	},

	/**
	* Replace MeSH terms with the string specififed
	* This function will also obey any engine specific overrides
	* e.g.
	*       "Something"[MESH] // Replaces in all instances
	*       "Something|Embase=Something Else"[MESH] // Replaces as 'something' in most cases, 'something else' in Embase engine
	*
	* @param string query The incomming full query string (PubMed format)
	* @param string replacement The replacement to apply ($1 is the original term)
	* @param string engine The active engine object
	* @return string The query string with replacements applied
	*/
	replaceMesh: function(q, replacement, engine) {
		[
			/"(.+?)"\[MESH\]/ig, // Pubmed style
			/exp\s+(.+?)\//ig, // Ovid style
		].forEach(function(re) {
			q = q.replace(re, function(line, mesh) {
				if (!/\|/.test(mesh)) {  // Simple replacement
					return replacement.replace('$1', mesh);
				} else { // Using rule set
					var rules = {};
					mesh.split(/\|/).forEach(function(term) {
						var ruleSyntax = /^\s*(.+)\s*=\s*(.+)\s*$/.exec(term);
						if (ruleSyntax) {
							rules[ruleSyntax[1].toLowerCase()] = ruleSyntax[2];
						} else {
							rules['DEFAULT'] = term;
						}
					});
					var matchingRule = _.find(engine.aliases, function(alias) {
						return !! rules[alias];
					});
					if (matchingRule) { // There is a rule specific to this engine
						return replacement.replace('$1', rules[matchingRule]);
					} else if (rules['DEFAULT']) {
						return replacement.replace('$1', rules['DEFAULT']);
					} else {
						return '';
					}
				}
			});
		});
		return q;
	},


	/**
	* Replace search fields for titles + abstracts
	* e.g. "Something"[tiab] => "Something".tw.
	* @param {string} q The query to operate on
	* @param {string} engine The currently active engine
	* @param {Object} options Additional options to parse
	* @param {string} [options.title=ti] What to replace title based syntax with
	* @param {string} [options.abstract=ab] What to replace abstract based syntax with
	* @param {string} [options.titleAbstract=tiab] What to replace combined title + abstract based syntax with
	* @param {string} [options.unknown=?] What to replace unknown filed syntax with
	* @return {string} The query string with replacements applied
	*/
	replaceSearchFields: function(q, replacement, engine, options) {
		var settings = _.defaults(options, {
			title: 'ti',
			abstract: 'ab',
			titleAbstract: 'tiab',
			unknown: '?',
		});

		[
			/"(.+?)"\[(TIAB|TW|AB)\]/ig, // Pubmed style
			/"(.+?)"\.(TW|TI|AB)\./ig, // Ovid style
			/(AND |OR )(.+?)\[(TIAB|TW|AB)\]/ig, // Pubmed style without quote enclosure
			/(AND |OR )(.+?)\.(TIAB|TW|AB)\./ig, // Ovid style without quote enclosure
		].forEach(function(re) {
			q = q.replace(re, function(line) {
				var prefix, term, fields;
				// If we are passed the optional prefix argument we need to stash that
				if (arguments.length == 6) {
					prefix = arguments[1];
					term = arguments[2];
					fields = arguments[3];
				} else {
					prefix = '';
					term = arguments[1];
					fields = arguments[2];
				}

				switch (fields.toLowerCase()) {
					case 'ti':
						fields = settings.title;
						break;
					case 'ab':
						fields = settings.abstract;
						break;
					case 'tiab':
					case 'tw':
						fields = settings.titleAbstract;
						break;
					default:
						fields = settings.unknown;
				}

				var out = replacement
					.replace('$1', term)
					.replace('$2', fields);

				if (prefix) out = prefix + out; // Add optional prefix back, if any
				return out;
			});
		});

		return q.replace(/"{2,}/g, '"'); // Remove doubled up speachmarks (inserted during Ovid term rewrite above)
	},


	/**
	* Replace adjacency markers
	* e.g. Ovid 'NEAR3' => CENTRAL 'adj3'
	* @param string q The query to operate on
	* @param string engine The currently active engine
	* @return string The query string with replacements applied
	*/
	replaceAdjacency: function(q, engine) {
		[
			/adj([0-9+]) /ig,
			/NEAR([0-9+]) /ig,
			/NEAR\/([0-9+]) /ig,
		].forEach(function(re) {
			q = q.replace(re, function(line, number) {
				var out = engine.adjacency(engine, number);
				return out ? out + ' ' : '';
			});
		});
		return q;
	},

	/**
	* Removes redundent speachmarks for single search terms
	* e.g. "single"[tiab] => single[tiab]
	*/
	replaceRedundentEncasing: function(q, engine) {
		return q.replace(/"([a-z0-9\-_]+?)"/ig, '$1');
	},

	/**
	* Simple text replacer wrapped in lodash handlers
	* This is really just STRING.replace() for lodash
	* @param string query The query to operate on
	* @param string|regexp search The search query to execute
	* @param string|regexp replacement The replacement to apply
	*/
	replace: function(q, search, replacement) {
		return q.replace(search, replacement);
	},
});
// }}}

app.controller('PolyglotSearchController', function($scope, $httpParamSerializer, $window, Assets, clipboard) {
	$scope.query = '';

	// MeSH auto-complete {{{
	$scope.refreshMeSH = function() {
		Assets.mesh().$promise.then(function(data) {
			$scope.smartArea.autocomplete[0].words = data;
		});
	};
	// FIXME: DISABLED FOR NOW - Will find a nicer way to do this in the future - MC 2015-07-15
	// $scope.refreshMeSH();
	// }}}

	// Examples functionality {{{
	$scope.examples = [
		{title: 'Failure of antibiotic prescribing for bacterial infections', query: '"Primary Health Care"[Mesh] OR Primary care OR Primary healthcare OR Family practice OR General practice\n\nAND\n\n"Treatment Failure"[Mesh] OR Treatment failure OR Treatment failures\n\nAND\n\n"Bacterial Infections"[Mesh] OR Bacteria OR Bacterial\n\nAND\n\n"Anti-Bacterial Agents"[Mesh] OR Antibacterial Agents OR Antibacterial Agent OR Antibiotics OR Antibiotic'},
		{title: 'Clinical prediction guides for whiplash', query: '"Neck"[Mesh] OR Neck OR Necks OR "Cervical Vertebrae"[Mesh] OR "Cervical Vertebrae" OR "Neck Muscles"[Mesh] OR "Neck Muscles" OR "Neck Injuries"[Mesh] OR "Whiplash Injuries"[Mesh] OR "Radiculopathy"[Mesh] OR "Neck Injuries" OR "Neck Injury" OR Whiplash OR Radiculopathies OR Radiculopathy\n\n AND\n\n "Pain"[Mesh] OR Pain OR Pains OR Aches OR Ache OR Sore\n\n AND\n\n "Decision Support Techniques"[Mesh] OR "Predictive Value of Tests"[Mesh] OR "Observer Variation"[Mesh] OR Decision Support OR Decision Aids OR Decision Aid OR Decision Analysis OR Decision Modeling OR Decision modelling OR Prediction OR Predictions OR Predictor OR Predicting OR Predicted'},
		{title: 'Prevalence of Thyroid Disease in Australia', query: '"Thyroid Diseases"[Mesh] OR "Thyroid diseases" OR "Thyroid disease" OR "Thyroid disorder" OR "Thyroid disorders" OR Goiter OR Goitre OR Hypothyroidism OR Hyperthyroidism OR Thyroiditis OR "Graves disease" OR Hyperthyroxinemia OR Thyrotoxicosis OR  "Thyroid dysgenesis" OR "Thyroid cancer" OR "Thyroid cancers" OR "Thyroid neoplasm" OR "Thyroid neoplasms" OR "Thyroid nodule" OR "Thyroid nodules" OR "Thyroid tumor" OR "Thyroid tumour" OR "Thyroid tumors" OR "Thyroid tumours" OR "Thyroid cyst" OR "Thyroid cysts" OR "Cancer of the thyroid"\n\n AND\n\n "Prevalence"[Mesh] OR "Epidemiology"[Mesh] OR "Prevalence" OR "Prevalences" OR Epidemiology OR Epidemiological\n\n AND\n\n "Australia"[Mesh] OR Australia OR Australian OR Australasian OR Australasia OR Queensland OR Victoria OR "New South Wales" OR "Northern Territory"'},
		{title: 'Prevalence of incidental thyroid cancer: A systematic review of autopsy studies', query: '(("Thyroid Neoplasms"[Mesh] OR "Adenocarcinoma, Follicular"[Mesh] OR "Adenocarcinoma, Papillary"[Mesh] OR OPTC)) OR (((Thyroid OR Follicular OR Papillary OR hurtle cell)) AND (cancer OR cancers OR carcinoma OR carcinomas OR Adenocarcinoma OR Adenocarcinomas neoplasm OR neoplasms OR nodule OR nodules OR tumor OR tumour OR Tumors OR Tumours OR cyst OR cysts))\n\nAND\n\n"Autopsy"[Mesh] OR "Autopsy" OR "Autopsies" OR Postmortem OR Post-mortem OR (Post AND mortem)\n\nAND\n\n"Prevalence"[Mesh] OR "Epidemiology"[Mesh] OR Prevalence OR Prevalences OR Epidemiology OR Epidemiological OR Frequency\n\nAND\n\n"Incidental Findings"[Mesh] OR Incidental OR Unsuspected OR Discovery OR Discoveries OR Findings OR Finding OR Occult OR Hidden'},
		{title: 'Positioning for acute respiratory distress in hospitalised infants and children', query: 'exp Lung Diseases/ OR exp Bronchial Diseases/ OR exp Respiratory Tract Infections/ OR exp Respiratory Insufficiency/ OR ((respir* or bronch*) adj3 (insuffic* or fail* or distress*)).tw. OR (acute lung injur* or ali).tw. OR (ards or rds).tw. OR (respiratory adj5 infect*).tw. OR (pneumon* or bronchopneumon*).tw. OR (bronchit* or bronchiolit*).tw. OR ((neonatal lung or neonatal respiratory) adj1 (diseas* or injur* or infect* or illness*)).tw. OR hyaline membrane diseas*.tw. OR bronchopulmonary dysplasia.tw. OR (croup or laryngotracheobronchit* or epiglottit* or whooping cough or legionel*).tw. OR (laryng* adj2 infect*).tw. OR (acute adj2 (episode or exacerbation*) adj3 (asthma or bronchiectasis or cystic fibrosis)).tw. OR respiratory syncytial viruses/ OR respiratory syncytial virus, human/ OR Respiratory Syncytial Virus Infections/ OR (respiratory syncytial virus* or rsv).tw.\n\nAND\n\nexp Posture/ OR (postur* or position*).tw. OR (supine or prone or semi-prone).tw. OR ((face or facing) adj5 down*).tw. OR (side adj5 (lay or laying or laid or lays or lying or lies)).tw. OR lateral.tw. OR upright.tw. OR (semi-recumbent or semirecumbent or semi-reclin* or semireclin* or reclin* or recumbent).tw. OR ((high or erect or non-erect or lean* or forward) adj5 (sit or sitting)).tw. OR (body adj3 tilt*).tw. OR (elevat* adj3 head*).tw.\n\nAND\n\n((randomized controlled trial or controlled clinical trial).pt. or randomized.ab. or randomised.ab. or placebo.ab. or drug therapy.fs. or randomly.ab. or trial.ab. or groups.ab.) not (exp animals/ not humans.sh.)'},
	];

	$scope.example = null;

	$scope.showExample = function() {
		var lastTitle = $scope.example ? $scope.example.title : null;
		do {
			$scope.example = _.sample($scope.examples);
		} while ($scope.example.title == lastTitle);
		$scope.query = _.clone($scope.example.query);
	};
	// }}}

	// Search engines {{{
	$scope.engines = [
		// PubMed {{{
		{
			id: 'pubmed',
			aliases: ['pubmed', 'p', 'pm', 'pubm'],
			title: 'PubMed',
			allowSearch: true,
			rewriter: function(q) { 
				return _(q)
					.wrapLines()
					.replaceJunk()
					.replaceMesh('"$1"[MESH]', this)
					.replaceSearchFields('"$1"[$2]', this, {title: 'ti', abstract: 'ab', titleAbstract: 'tiab'})
					.replaceAdjacency(this)
					.replaceRedundentEncasing(this)
					.value();
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
			adjacency: function(engine, number) {
				return '';
			},
		},
		// }}}
		// Ovid Medline {{{
		{
			id: 'ovid',
			aliases: ['ovid', 'o', 'ov'],
			title: 'Ovid Medline',
			allowSearch: true,
			rewriter: function(q) { 
				return _(q)
					.wrapLines()
					.replaceJunk()
					.replaceMesh('exp $1/', this)
					.replaceSearchFields('"$1".$2.', this, {title: 'ti', abstract: 'ab', titleAbstract: 'tw'})
					.replaceAdjacency(this)
					.replaceRedundentEncasing(this)
					.value();
			},
			linker: function(engine) {
				return {
					method: 'POST',
					action: 'http://ovidsp.tx.ovid.com.ezproxy.bond.edu.au/sp-3.17.0a/ovidweb.cgi',
					fields: {
						textBox: engine.query,
					},
				};
			},
			adjacency: function(engine, number) {
				return 'adj' + number;
			},
		},
		// }}}
		// Cochrane CENTRAL {{{
		{
			id: 'cochrane',
			aliases: ['cochrane', 'c'],
			title: 'Cochrane CENTRAL',
			allowSearch: false,
			rewriter: function(q) { 
				return _(q)
					.wrapLines()
					.replaceJunk()
					.replaceMesh('[mh "$1"]', this)
					.replaceSearchFields('"$1":$2', this, {title: 'ti', abstract: 'ab', titleAbstract: 'ti,ab'})
					.replaceAdjacency(this)
					.replaceRedundentEncasing(this)
					.value();
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
			adjacency: function(engine, number) {
				return 'NEAR' + number;
			},
		},
		// }}}
		// Embase {{{
		{
			id: 'embase',
			title: 'Embase',
			aliases: ['embase', 'e', 'eb'],
			allowSearch: false,
			rewriter: function(q) { 
				return _(q)
					.wrapLines()
					.replaceJunk()
					.replace("'", '')
					.replaceMesh("'$1'/exp", this)
					.replaceSearchFields('"$1":$2', this, {title: 'ti', abstract: 'ab', titleAbstract: 'ti,ab'})
					.replaceAdjacency(this)
					.replaceRedundentEncasing(this)
					.value();
			},
			linker: function(engine) {
				return {
					method: 'GET',
					action: 'http://www.embase.com.ezproxy.bond.edu.au/search',
					fields: {
						sb: 'y',
						search_query: engine.query.replace(/\n+/g, ' '),
					},
				};
			},
			adjacency: function(engine, number) {
				return 'NEAR/' + number;
			},
		},
		// }}}
		// Web of Science {{{
		{
			id: 'webofscience',
			title: 'Web of Science',
			aliases: ['webofscience', 'w', 'wos', 'websci'],
			allowSearch: false,
			rewriter: function(q) { 
				return _(q)
					.wrapLines()
					.replaceJunk()
					.replace(/"(.+?)"\[MESH\] (AND|OR) /ig, '')
					.replace(/"(.+?)"\[MESH\]/ig, '')
					.replaceSearchFields('', this, {})
					.replaceAdjacency(this)
					.replaceRedundentEncasing(this)
					.value();
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
			adjacency: function(engine, number) {
				return '';
			},
		},
		// }}}
		// CINAHL {{{
		{
			id: 'cinahl',
			title: 'CINAHL',
			aliases: ['cinahl', 'ci', 'cnal'],
			allowSearch: false,
			rewriter: function(q) { 
				return _(q)
					.wrapLines()
					.replaceJunk()
					.replace("'", '')
					.replaceMesh('(MH "$1+")', this)
					// FIXME: TIAB =~ TI term AND AB term
					.replaceSearchFields('$2 "$1"', this, {title: 'ti', abstract: 'ab', titleAbstract: ''})
					.replaceAdjacency(this)
					.replaceRedundentEncasing(this)
					.value();
			},
			linker: function(engine) {
				return {
					method: 'POST',
					action: 'http://web.a.ebscohost.com.ezproxy.bond.edu.au/ehost/resultsadvanced',
					fields: {
						bquery: engine.query,
					},
				};
			},
			adjacency: function(engine, number) {
				return 'N' + number;
			},
		},
		// }}}
	];
	// }}}

	// Query watcher + refresher {{{
	$scope.$watch('query', function() {
		$scope.engines.forEach(function(engine) {
			engine.query = engine.rewriter.call(engine, _.clone($scope.query));
		});
	});
	// }}}

	// Engine interaction {{{
	$scope.toggleExpandEngine = function(engine) {
		engine.expanded = !engine.expanded;
	};

	$scope.engineClipboard = function(engine) {
		clipboard.copyText(engine.query);
	};

	$scope.engineOpen = function(engine) {
		var linker = engine.linker(engine);
		switch (linker.method) {
			case 'POST':
			case 'GET':
				$('#engineForm').remove();
				$('<form id="engineForm" target="_blank" action="' + linker.action + '" method="' + linker.method + '" style="display: none"></form>').appendTo($('body'))
				_.forEach(linker.fields, (v, k) => {
					$('<input name="' + k + '"/>')
						.attr('value', v)
						.appendTo($('#engineForm'));
				});
				$('#engineForm').submit();
				break;
			case 'GET-DIRECT':
				// Special case to just open a new window directly with the search query encoded
				console.log('URL', linker.action + '?' + $httpParamSerializer(linker.fields));
				$window.open(linker.action + '?' + $httpParamSerializer(linker.fields), '_blank');
		}
	};
	// }}}
});

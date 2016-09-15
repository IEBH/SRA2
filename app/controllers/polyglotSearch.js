app.controller('PolyglotSearchController', function($scope, $httpParamSerializer, $window, Assets, clipboard, Polyglot) {
	$scope.query = '';
	$scope.engines = _.map(Polyglot.engines, (engine, id) => { engine.id = id; return engine });
	$scope.showDebugging = false; // Filter options by debugging status

	$scope.options = {
		// Parser
		groupLines: true,
		groupLinesAlways: false,
		preserveNewlines: true,

		// Compiler (per engine)
		replaceWildcards: true,
	};

	// MeSH auto-complete {{{
	// NOTE: Need to add `smart-area="smartArea"` back to main <textarea/> input in view to activate
	$scope.smartArea = {
		autocomplete: [{
			words: [],
			autocompleteOnSpace: 0
		}]
	};

	$scope.refreshMeSH = function() {
		Assets.mesh().$promise.then(function(data) {
			$scope.smartArea.autocomplete[0].words = data;
		});
	};
	// FIXME: DISABLED FOR NOW - Will find a nicer way to do this in the future - MC 2015-07-15
	// $scope.refreshMeSH();
	// }}}

	// .example / .showExample() {{{
	$scope.example = null;

	$scope.showExample = function() {
		var lastTitle = $scope.example ? $scope.example.title : null;
		do {
			$scope.example = _.sample(Polyglot.examples);
		} while ($scope.example.title == lastTitle);
		$scope.query = $scope.example.query + '';
	};
	// }}}

	// Query watcher + refresher {{{
	$scope.$watchGroup(['query', 'options.groupLines', 'options.groupLinesAlways', 'options.preserveNewLines', 'options.replaceWildcards'], function() {
		var translations = Polyglot.translateAll($scope.query, $scope.options);
		$scope.engines.forEach(engine => engine.translated = translations[engine.id]);
	});
	// }}}

	// Template functionality {{{
	$scope.templates = _.map(Polyglot.templates, (template, id) => { template.id = id; return template });
	$scope.filterDebugging = function(item) {
		if ($scope.showDebugging) return true;
		return !item.debugging;
	};

	$scope.insertTemplate = function(template) {
		var selStart = $('#query')[0].selectionStart;
		var sel = $('#query').val();
		var lastLineStart = sel.lastIndexOf('\n', selStart);
		var nextLineStart = sel.indexOf('\n', selStart);
		var thisLine = (lastLineStart > -1 && nextLineStart ? sel.substr(lastLineStart, nextLineStart - lastLineStart) : '');
		var insertAt = 'end'; // ENUM: end, nextLine, here

		// Work out where to insert {{{
		/*
		console.log('SEL START', selStart);
		console.log('SEL LEN', sel.length);
		console.log('LAST LINE', lastLineStart);
		console.log('NEXT LINE', nextLineStart);
		console.log('IS IN LINE', isInLine);
		*/

		if (nextLineStart == lastLineStart) {
			console.log('LINE IS [' + thisLine + ']');
			insertAt = 'nextLine';
		} else if (lastLineStart == selStart - 1) {
			insertAt = 'here';
			console.log('Start of line');
		} else if (nextLineStart > -1 && lastLineStart > -1 && nextLineStart - lastLineStart > 0) {
			insertAt = 'nextLine';
		} else {
			insertAt = 'end';
		}
		// }}}

		console.log('Insert template', insertAt);

		var caretPos;

		switch (insertAt) {
			case 'here':
				$scope.query = sel.substr(0, selStart) + '<' + template.id + '>\n' + sel.substr(selStart);
				caretPos = selStart + template.id.length + 2;
				break;
			case 'nextLine':
				$scope.query = sel.substr(0, nextLineStart) + '\n\nAND\n\n<' + template.id + '>\n' + sel.substr(nextLineStart);
				caretPos = nextLineStart + template.id.length + 5;
				break;
			case 'end':
			default:
				caretPos = $('#query').val().length;
				$scope.query += '\n\nAND\n\n<' + template.id + '>';
		}

		$('#query')[0].setSelectionRange(caretPos, caretPos);

		$('#query').select();
	};
	// }}}

	// Engine interaction {{{
	$scope.toggleExpandEngine = function(engine) {
		engine.expanded = !engine.expanded;
	};

	$scope.engineOpen = function(engine) {
		var opener = engine.open(engine);
		switch (opener.method) {
			case 'POST':
			case 'GET':
				$('#engineForm').remove();
				$('<form id="engineForm" target="_blank" action="' + opener.action + '" method="' + opener.method + '" style="display: none"></form>').appendTo($('body'))
				_.forEach(opener.fields, (v, k) => {
					$('<input name="' + k + '"/>')
						.attr('value', v)
						.appendTo($('#engineForm'));
				});
				$('#engineForm').submit();
				break;
			case 'GET-DIRECT':
				// Special case to just open a new window directly with the search query encoded
				console.log('URL', opener.action + '?' + $httpParamSerializer(opener.fields));
				$window.open(opener.action + '?' + $httpParamSerializer(opener.fields), '_blank');
		}
	};
	// }}}

	$scope.clear = () => $scope.query = '';

	$scope.clipboard = clipboard.copyText;
});

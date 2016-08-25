app.controller('PolyglotSearchController', function($scope, $httpParamSerializer, $window, Assets, clipboard, Polyglot) {
	$scope.query = '';
	$scope.engines = _.map(Polyglot.engines, (engine, id) => { engine.id = id; return engine });
	$scope.enginesShowDebugging = false; // Filter engines by debugging status

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

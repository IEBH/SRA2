app.controller('helpListController', function($scope) {
	$scope.topics = [
		{
			id: 'libraries',
			title: 'Importing / Exporting Libraries',
			url: 'https://docs.google.com/document/d/1ebqWjSz6WlztDmNAvWVkxzU4EV2MbR5iG6EU0cbwT-Q/pub?embedded=true',
		},
		{
			id: 'dedupe',
			title: 'DeDuplicator',
			url: 'https://docs.google.com/document/d/1jGUozyJiSfMCOeotC0XIMqWNSOTYhqt6zJGfUOWsIvY/pub?embedded=true',
		},
		{
			id: 'endnote-helper',
			title: 'EndNote-Helper',
			url: 'https://docs.google.com/document/d/1KqVi5TiZ_LLW-Sl-PGTEke_L93CAysSy7e-vRVK7GY4/pub?embedded=true',
		},
		{
			id: 'wordfreq',
			title: 'Word Frequency Analyser',
			url: 'https://docs.google.com/document/d/1OHeetDraMJiaxpCLr6VAJJXmPxdBPE_sU2wLKG5ODrc/pub?embedded=true',
		},
		{
			id: 'polyglot',
			title: 'Polyglot Search Syntax Translator',
			url: 'https://docs.google.com/document/d/1zL2_bIyZyhikrir-veUc2M59e7_c5iAmsHIu6JBxyB4/pub?embedded=true',
		},
	];
});

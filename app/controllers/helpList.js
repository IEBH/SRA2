app.controller('helpListController', function($scope) {
	$scope.topics = [
		{
			id: 'libraries',
			title: 'Importing / Exporting Libraries',
			url: 'https://docs.google.com/document/d/1ebqWjSz6WlztDmNAvWVkxzU4EV2MbR5iG6EU0cbwT-Q/pub?embedded=true',
			show: true,
		},
		{
			id: 'dedupe',
			title: 'DeDuplicator',
			url: 'https://docs.google.com/document/d/1jGUozyJiSfMCOeotC0XIMqWNSOTYhqt6zJGfUOWsIvY/pub?embedded=true',
			show: true,
		},
		{
			id: 'dedupe-offline',
			title: 'DeDuplicator (Offline)',
			url: 'https://docs.google.com/document/d/1UUo9jr2lGXATXAlLjJ6O71Yerj-BX9xM5NB2bwhOCqM/pub?embedded=true',
			show: true,
		},
		{
			id: 'endnote-helper',
			title: 'EndNote-Helper',
			url: 'https://docs.google.com/document/d/1KqVi5TiZ_LLW-Sl-PGTEke_L93CAysSy7e-vRVK7GY4/pub?embedded=true',
			show: true,
		},
		{
			id: 'wordfreq',
			title: 'Word Frequency Analyser',
			url: 'https://docs.google.com/document/d/1OHeetDraMJiaxpCLr6VAJJXmPxdBPE_sU2wLKG5ODrc/pub?embedded=true',
			show: true,
		},
		{
			id: 'polyglot',
			title: 'Polyglot Search Syntax Translator',
			url: 'https://docs.google.com/document/d/1zL2_bIyZyhikrir-veUc2M59e7_c5iAmsHIu6JBxyB4/pub?embedded=true',
			show: true,
		},

		// Accessible from top level menu - dont show the following in help topics list
		{
			id: 'tools',
			title: 'Recommended Tools',
			url: 'https://docs.google.com/document/d/1yO_O1kpwYmkVWcWXeTjbd2jK53nTItxNbAZx07wgjKg/pub?embedded=true',
			show: false,
		},
		{
			id: 'whats-new',
			title: 'Whats New',
			url: 'https://docs.google.com/document/d/1foFrSxPZ2_IQ3V5cgLHWCD1UvkI6K3JHbjXfI9-fI6A/pub?embedded=true',
			show: false, // Accessible from top level menu - dont show in help topics list
		},
	];
});

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
			title: 'DeDuplicator (old)',
			url: 'https://docs.google.com/document/d/1jGUozyJiSfMCOeotC0XIMqWNSOTYhqt6zJGfUOWsIvY/pub?embedded=true',
			show: true,
		},
		{
			id: 'dedupe-offline',
			title: 'DeDuplicator (old - Offline)',
			url: 'https://docs.google.com/document/d/1UUo9jr2lGXATXAlLjJ6O71Yerj-BX9xM5NB2bwhOCqM/pub?embedded=true',
			show: true,
		},
		{
			id: 'wordfreq',
			title: 'Word Frequency Analyser',
			url: 'https://docs.google.com/document/d/1OHeetDraMJiaxpCLr6VAJJXmPxdBPE_sU2wLKG5ODrc/pub?embedded=true',
			show: true,
		},
		{
			id: 'searchRefinery',
			title: 'SearchRefinery',
			url: 'https://docs.google.com/document/d/e/2PACX-1vSoxP2JYqUtCr6gLZTbSx8-vJ14X1vM6pL6WY4Whayyc8Yeyh4zCOlCJOSUf2Nhaq_C_-ZMmDHcUZ1d/pub?embedded=true',
			show: true,
		},
		{
			id: 'polyglot',
			title: 'Polyglot Search Translator',
			url: 'https://docs.google.com/document/d/1zL2_bIyZyhikrir-veUc2M59e7_c5iAmsHIu6JBxyB4/pub?embedded=true',
			show: true,
		},
		{
			id: 'sra-helper',
			title: 'SRA-Helper',
			url: 'https://docs.google.com/document/d/1KqVi5TiZ_LLW-Sl-PGTEke_L93CAysSy7e-vRVK7GY4/pub?embedded=true',
			show: true,
		},
		{
			id: 'deduplicator',
			title: 'Deduplicator',
			url: 'https://docs.google.com/document/d/e/2PACX-1vRZshMTQ_61kWRKQdwIgb1vUOH0UK0fdw1aiRMOoSp7V_EEkzN-RAsSbcKee-003vzdK72LqdUijYCC/pub?embedded=true',
			show: true,
		},
		{
			id: 'screenatron',
			title: 'Screenatron',
			url: 'https://docs.google.com/document/d/e/2PACX-1vQbXMaBlal2LXZoY1Km6Gq3ZmxQkGpNbNyuQM1MpkqQ9S0T7Zv--UW7h96ug4L9FUWrcKadZqVoFKa5/pub?embedded=true',
			show: true,
		},
		{
			id: 'disputatron',
			title: 'Disputatron',
			url: 'https://docs.google.com/document/d/e/2PACX-1vR__jD5ZsH6dqQMqgFoppbrWglXedHE_3L_t7De2JeBGN-vlTCRnq-QgY5o8UAJWx6fFfgnODo0KMBa/pub?embedded=true',
			show: true,
		},
		// {
		// 	id: 'spidercite',
		// 	title: 'SpiderCite',
		// 	url: 'https://docs.google.com/document/d/e/2PACX-1vQvLTMeQl3N0FLDO2GxzqAtnq1X5znakUXSEL2hUVNRjiEd3dfvDaNqDmZMl0B42SqaNNz8l7lSL0R_/pub?embedded=true',
		// 	show: true,
		// },


		// Accessible from top level menu - dont show the following in help topics list
		{
			id: 'tools',
			title: 'Recommended Tools',
			url: 'https://docs.google.com/document/d/1yO_O1kpwYmkVWcWXeTjbd2jK53nTItxNbAZx07wgjKg/pub?embedded=true',
			show: false,
		},
		{
			id: 'citing',
			title: 'Citing us',
			url: 'https://docs.google.com/document/d/e/2PACX-1vSXq5kubanl-APyOARTgcPWsOyYCW54rSa-tXbJEO25942h_MXHEX3LABOMwkBYxUFUgyJ9_evOaOoQ/pub?embedded=true',
			show: true,
		},
		/* Abandoned now - MC 2020-02-06
		{
			id: 'whats-new',
			title: 'Whats New',
			url: 'https://docs.google.com/document/d/1foFrSxPZ2_IQ3V5cgLHWCD1UvkI6K3JHbjXfI9-fI6A/pub?embedded=true',
			show: false, // Accessible from top level menu - dont show in help topics list
		},
		*/
	];
});

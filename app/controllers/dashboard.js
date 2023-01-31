app.controller('dashboardController', function($scope, $timeout) {
	$timeout(()=> {
		embedGDoc({
			selector: '#gdoc',
			url: 'https://docs.google.com/document/d/e/2PACX-1vRA802xdOej_gfwV2SFcG29xjD1-s9HB_2wMxFl1GKx8bnNb9TDso2xnEYbZQjgyzDbzyA7RWqQWiR1/pub?embedded=true',
		});
	});
});

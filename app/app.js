var app = angular.module('app', [
	'angular-async-chainable',
	'angular-clipboard',
	'angular-venn',
	'angular-bs-confirm',
	'angular-bs-text-highlight',
	'angular-bs-tooltip',
	'angular-q-limit',
	'angular-ui-loader',
	'colorpicker.module',
	'ng-collection-assistant',
	'ngPolyglot',
	'ngResource',
	'ngTreeTools',
	'ui.grid',
	'ui.grid.pagination',
	'ui.grid.selection',
	'ui.router',
	'ui-notification',
	'uiSwitch',
	'xeditable'
]);

app.config(function($compileProvider) {
	if (!location.host.match(/^local|glitch|slab/)) { // Are we on localhost etc?
		// Disabled in production for performance boost
		$compileProvider.debugInfoEnabled(false);
	}
});

app.config(function($httpProvider) {
	// Enable async HTTP for performance boost
	$httpProvider.useApplyAsync(true);
});

app.config(function ($sceDelegateProvider) {
	$sceDelegateProvider.resourceUrlWhitelist([
		'self', // trust all resources from the same origin
		'https://www.youtube.com/**',
		'https://docs.google.com/**',
	]);
});

// Loader display while routing {{{
app.run(function($rootScope, $loader, $state) {
	$rootScope.$on('$stateChangeStart', () => $loader.clear().start('stateChange'));
	$rootScope.$on('$stateChangeSuccess', () => $loader.stop('stateChange'));
	$rootScope.$on('$stateChangeError', () => $loader.stop('stateChange'));
});
// }}}

// Notification config {{{
app.config(function(NotificationProvider) {
	NotificationProvider.setOptions({
		positionX: 'right',
		positionY: 'bottom',
	});
});
// }}}

// Router related bugfixes {{{
app.run(function($rootScope) {
	// BUGFIX: Destory any open Bootstrap modals during transition {{{
	$rootScope.$on('$stateChangeStart', function() {
		// Destory any open Bootstrap modals
		$('body > .modal-backdrop').remove();

		// Destroy any open Bootstrap tooltips
		$('body > .tooltip').remove();

		// Destroy any open Bootstrap popovers
		$('body > .popover').remove();
	});
	// }}}
	// BUGFIX: Focus any input element with the 'autofocus' attribute on state change {{{
	$rootScope.$on('$stateChangeSuccess', function() {
		$('div[ui-view=main]').find('input[autofocus]').focus();
	});
	// }}}
});
// }}}

// Google Analytics {{{
app.run(function($rootScope, $location, $window) {
	$rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
		if (!$window.ga) return;
		$window.ga('set', {
			page: $location.path(),
			title: toState.name,
		});
		$window.ga('send', 'pageview');
	});
});
// }}}

// Config: editable-text {{{
app.run(function(editableThemes, editableOptions) {
	editableThemes.bs3.inputClass = 'input-sm';
	editableThemes.bs3.buttonsClass = 'btn-sm';
	editableThemes.bs3.submitTpl = '<button type="submit" class="btn btn-success"><span></span></button>';
	editableThemes.bs3.cancelTpl = '<button type="button" class="btn btn-danger" ng-click="$form.$cancel()"><span></span></button>';
	editableOptions.icon_set = 'font-awesome';
	editableOptions.theme = 'bs3';
});
// }}}

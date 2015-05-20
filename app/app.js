var app = angular.module('app', [
	'colorpicker.module',
	'ng-collection-assistant',
	'ngResource',
	'ui.router',
	'xeditable'
]);

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

app.run(function($rootScope) {
	// BUGFIX: Destory any open Bootstrap modals during transition {{{
	$rootScope.$on('$stateChangeStart', function() {
		$('body > .modal-backdrop').remove();
	});
	// }}}
});

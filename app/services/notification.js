/**
* Generic notification mapper
* This service is really just a thin wrapper around Notification (ui-notification) which provides some additional functionality:
*
* Additional features:
*
* 	* Exposed as `$notification` rather than `Notification` which could be confused for a model
*	* Adds `.catch(err)` method which attempts to determine the correct error text to display
*/
app.factory('$notification', function($rootScope, Notification) {
	var notification = {};

	notification.primary = Notification.primary.bind(Notification);
	notification.info = Notification.info.bind(Notification);
	notification.success = Notification.success.bind(Notification);
	notification.warning = Notification.warning.bind(Notification);
	notification.error = Notification.error.bind(Notification);

	notification.catch = function(obj) {
		console.log('$notification.catch', obj);
		if (_.isObject(obj) && obj.status && obj.status == -1 && obj.statusText && obj.statusText == '') return notification.offline(true);

		notification.error(
			_.isUndefined(obj) ? 'An error has occured' :
			_.isString(obj) ? obj :
			_.has(obj, 'error') && obj.error ? obj.error :
			_.has(obj, 'data.errmsg') && obj.data.errmsg ? obj.data.errmsg :
			_.has(obj, 'statusText') && obj.statusText ? obj.statusText :
			obj.toString() ? obj.toString() :
			'An error has occured'
		);
	};

	// $notification.offline(isOffline=true) {{{
	notification.offlineKiller;
	notification.offline = function(isOffline=true) {
		if (isOffline) {
			if (!notification.offlineKiller) { // Not yet shown the message
				Notification.error({
					delay: false,
 					closeOnClick: false,
					message: 'Cannot communicate with server'
				})
					.then(scope => notification.offlineKiller = scope.kill); // Grab the notification killer from inside the promise (when it resolves)
			}
		} else if (notification.offlineKiller) { // No longer offline but we need to tidy up the warning
			notification.offlineKiller();
			notification.offlineKiller = undefined;
		}
	};
	// }}}

	$rootScope.$on('isOffline', function(e, isOffline) {
		notification.offline(isOffline);
	});

	return notification;
});

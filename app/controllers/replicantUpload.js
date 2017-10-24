app.controller('replicantUploadController', function($filter, $scope, $timeout, Loader) {
	$scope.submit = function() {
		$timeout(function() {
			$('form')
				.ajaxSubmit({
					url: '/api/replicant/import',
					type: 'POST',
					dataType: 'json',
					forceSync: true,
					beforeSubmit: function() {
						$scope.$apply(function() {
							Loader
								.start()
								.title('Uploading RevMan file...')
								.text('Prepairing to upload file...');
						});
					},
					uploadProgress: function(event, position, total, percentComplete) {
						$scope.$apply(function() {
							if (percentComplete >= 100 || position >= total) {
								Loader
									.text('Processing file...')
									.progress(100);
							} else {
								Loader
									.text($filter('filesize')(position) + ' / ' + $filter('filesize')(total) + ' uploaded')
									.progress(percentComplete);
							}
						});
					},
					complete: function(res) {
						Loader.finish();
						if (res.responseJSON && res.responseJSON.url) {
							window.location = res.responseJSON.url;
						} else {
							window.location = '/#/libraries';
						}
					},
				});
		});

		return false;
	};
});

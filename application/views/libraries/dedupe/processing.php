<script>
var libraryid = <?=$library['libraryid']?>;
var updateDelay = 1000;
$(function() {
	$.requestUpdate = function () {
		$.ajax({
			url: '/api/libraries/dupes',
			data: {libraryid: libraryid},
			type: 'POST',
			dataType: 'json',
			success: function(json) {
				if (!json.payload || json.payload.done >= json.payload.total) { // Finished
					document.location = '/libraries/dedupe/' + libraryid;
				} else {
					var now = new Date();
					$('#progress .bar').css('width', parseInt((json.payload.done / json.payload.total) * 100) + '%');
					$('#progress-text').text('Processed: ' + json.payload.done + ' / ' + json.payload.total + ' (' + json.payload.dupes + ' duplicates)');
					$('#progress-updated').text('Last updated: ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds());
					setTimeout($.requestUpdate, updateDelay);
				}
			},
			error: function(e, err) {
				var now = new Date();
				$('#progress').addClass('progress-danger');
				$('#progress-text').text('Error while getting de-duplication update: ' + err);
				$('#progress-updated').text('Last updated: ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds());
			}
		});
	};
	$.requestUpdate();
});
</script>
<div class="row-fluid pad-top">
	<div class="span8 offset2">
		<div class="alert alert-info alert-block">
			<h1 class="pull-center"><i class="fa fa-spinner fa-spin"></i> De-duplicating references...</h1>
			<div class="row-fluid pad-top">
				<div class="span8 offset2">
					<div id="progress" class="progress progress-striped active">
						<div class="bar" style="width: 0%"></div>
					</div>
					<div class="pull-center" id="progress-text"></div>
					<div class="pull-center muted small pad-top-small" id="progress-updated"></div>
				</div>
			</div>
		</div>
	</div>
</div>

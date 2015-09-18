<script>
$(function() {
	$('select[name=where]')
		.on('change', function() {
			if ($(this).val() == 'new') {
				$('input[name=name_new]').closest('.control-group').show();
				$('select[name=existing_id]').closest('.control-group').hide();
			} else {
				$('input[name=name_new]').closest('.control-group').hide();
				$('select[name=existing_id]').closest('.control-group').show();
			}
		})
		.trigger('change');
	$('input[name=advanced]')
		.on('change', function() {
			$('[name=auto_dedupe], [name=debug]').parents('.control-group')
				.toggle($(this).is(':checked'));
		})
		.trigger('change');
});
</script>
<form action="/libraries/import" method="post" class="form-horizontal" enctype="multipart/form-data">
	<?=$this->Waveform->Table()?>
	<div class="pull-center">
		<button class="btn btn-success" action="submit"><i class="fa fa-check"></i> Import file</button>
	</div>
</form>

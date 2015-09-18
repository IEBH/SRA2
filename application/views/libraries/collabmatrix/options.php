<div class="alert alert-info">
	This tool calculates the collaboration between all authors in a reference library.
</div>

<form action="/libraries/collabmatrix" method="post" class="form-horizontal" enctype="multipart/form-data">
	<?=$this->Waveform->Table()?>
	<div class="pull-center">
		<button class="btn btn-success" action="submit"><i class="fa fa-check"></i> Calculate Collaborations</button>
	</div>
</form>

<div class="alert alert-default">
	<h3>Warning - feature soon to be depreciated</h3>
	<p>The collaboration matrix tool will soon be merged into the tool set of the main SRA project. Please start to use the new <a href="/libraries/import">library importer</a> as this tool will be depreciated in the future.</p>
</div>

<div class="alert alert-info">
	This tool will accept a CSV file of references and compute the collaboration between all other authors.<br/>
	For example if two people have worked on multiple papers together each will get one point of collaboration.
</div>

<form action="/tools/collabmatrix" method="post" class="form-horizontal" enctype="multipart/form-data">
	<?=$this->Waveform->Table()?>
	<div class="pull-center">
		<button class="btn btn-success" action="submit"><i class="fa fa-check"></i> Calculate</button>
	</div>
</form>

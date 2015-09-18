<? if (!$papers) { ?>
<div class="alert">
	<h3>No references found</h3>
	<p>No references were found. Maybe you should try adding some from a <a href="/">search</a></p>
</div>
<? } else { ?>
<table class="table table-bordered table-stripped">
	<tr>
		<th width="50px">&nbsp;</th>
		<th>Source</th>
		<th>Ref</th>
		<th>Name</th>
	</tr>
	<? foreach ($papers as $paper) { ?>
	<tr>
		<? if ($this->Basket->Has('who-' . $paper['paperid'])) { ?>
		<td><a href="/who/remove/<?=$paper['paperid']?>" class="btn btn-success"><i class="fa fa-check-square-o"></i></td>
		<? } else { ?>
		<td><a href="/who/add/<?=$paper['paperid']?>" class="btn"><i class="fa fa-square-o"></i></td>
		<? } ?>
		<td><a href="<?=$paper['url']?>"><?=$paper['paperid']?></a></td>
		<td><a href="<?=$paper['url']?>"><?=$paper['name']?></a></td>
	</tr>
	<? } ?>
</table>
<? } ?>

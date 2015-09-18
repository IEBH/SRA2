<style>
#searchform {
	margin-top: 20px;
	width: 100%;
}
#searchform .btn-group {
	width: 100%;
}
#searchform h1 {
	font-size: 32px;
	margin: 20px;
}
#searchform .btn {
	height: 55px;
	font-size: 25px;
	padding: 0 10px;
	vertical-align: top;
}
#q {
	width: 70%;
	font-size: 25px;
	height: 45px;
}
#search-outer .btn-mini {
	font-size: 14px;
}
</style>
<script>
$(function() {

$(document)
	.on('click', '[data-action=add]', function(event) {
		event.preventDefault();
		var button = $(this);
		button.html('<i class="fa fa-spinner fa-spin"></i>');
		$('#search-outer').load('/who/add/' + button.data('ref') + ' #search-inner');
	})
	.on('click', '[data-action=remove]', function(event) {
		event.preventDefault();
		var button = $(this);
		button.html('<i class="fa fa-spinner fa-spin"></i>');
		$('#search-outer').load('/who/remove/' + button.data('ref') + ' #search-inner');
	})
	.on('click', '[data-action=add-all]', function(event) {
		event.preventDefault();
		var button = $(this);
		button.html('<i class="fa fa-spinner fa-spin"></i>');
		var allRefs = [];
		$('#search-inner [data-ref]').each(function() {
			allRefs.push($(this).data('ref'));
		});
		$('#search-outer').load('/who/add #search-inner', {refs: allRefs});
	})
	.on('click', '[data-action=remove-all]', function(event) {
		event.preventDefault();
		var button = $(this);
		button.html('<i class="fa fa-spinner fa-spin"></i>');
		var allRefs = [];
		$('#search-inner [data-ref]').each(function() {
			allRefs.push($(this).data('ref'));
		});
		$('#search-outer').load('/who/remove #search-inner', {refs: allRefs});
	});

});
</script>
<form action="/search" method="GET" class="row">
	<div id="searchform" class="pull-center">
		<? if ($papers === null) { ?>
		<h1 class="pad-top">Search for research papers</h1>
		<? } ?>
		<div class="btn-group">
			<input data-focus="1" id="q" name="q" type="search" value="<?=$_REQUEST['q']?>"/>
			<button class="btn" type="submit"><i class="fa fa-search"></i></button>
		</div>
	</div>
</form>
<div id="search-outer"><div id="search-inner">
<?
if ($papers) {
	$basket = $this->Library->GetBasket();

$hasall = true;
foreach ($papers as $id => $paper)
	if (! $papers[$id]['has'] = $this->Library->Has('who-' . $paper['paperid'], $basket['libraryid']))
		$hasall = false;
?>
<table class="table table-bordered table-stripped">
	<tr>
		<th width="50px">
			<div class="pull-center">
			<? if ($hasall) { ?>
				<a href="#" class="btn btn-mini btn-success" data-action="remove-all"><i class="fa fa-check-square-o"></i></a>
			<? } else { ?>
				<a href="#" class="btn btn-mini" data-action="add-all"><i class="fa fa-square-o"></i></a>
			<? } ?>
			</div>
		</th>
		<th>Ref</th>
		<th>Name</th>
	</tr>
	<? foreach ($papers as $paper) { ?>
	<tr>
		<? if ($paper['has']) { ?>
		<td><a href="/who/remove/<?=$paper['paperid']?>" class="btn btn-success" data-action="remove" data-ref="<?=$paper['paperid']?>"><i class="fa fa-check-square-o"></i></td>
		<? } else { ?>
		<td><a href="/who/add/<?=$paper['paperid']?>" class="btn" data-action="add" data-ref="<?=$paper['paperid']?>"><i class="fa fa-square-o"></i></td>
		<? } ?>
		<td><a href="<?=$paper['url']?>"><?=$paper['paperid']?></a></td>
		<td><a href="<?=$paper['url']?>"><?=$paper['name']?></a></td>
	</tr>
	<? } ?>
</table>
<? } elseif ($papers !== null) { ?>
<div class="alert">
	<h3>No results found</h3>
	<p>No results were found from this search. Maybe try removing some of your search criteria.</p>
</div>
<? } ?>
</div></div>

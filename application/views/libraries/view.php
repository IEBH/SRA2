<script>
$(function() {
	$('#tag-filter').on('click', 'a[data-filterid]', function() {
		$('#tag-filter > li').removeClass('active');
		$(this).closest('li').addClass('active');

		if (!$(this).data('filterid')) {
			$('#reference-table > tbody > tr').show();
		} else {
			$('#reference-table > tbody > tr').hide();
			$('#reference-table > tbody > tr[rel="' + $(this).data('filterid') + '"]').show();
		}
	});
});
</script>
<div ng-controller="libraryController">
	<legend>
		<?=$library['title']?>
		<div class="btn-group pull-right">
			<a class="btn dropdown-toggle" data-toggle="dropdown" href="#">
				<i class="fa fa-cog"></i> Tools <span class="caret"></span>
			</a>
			<ul class="dropdown-menu" ng-include="'/partials/library-verbs.html'"></ul>
		</div>
	</legend>

	<? if (in_array($library['status'], qw('dedupe deduped'))) { ?>
	<div class="alert alert-info alert-block">
		<a href="#" data-dismiss="alert" class="close"><i class="fa fa-times-sign"></i></a>
		<h3><i class="fa fa-bell-o icon-animated-bell"></i> De-duplication in progress</h3>
		<p>This library is still marked as having duplicate references.</p>
		<div class="pull-center pad-top">
			<a class="btn" href="/libraries/dedupe/<?=$library['libraryid']?>"><i class="fa fa-compress"></i> Examine duplicates</a>
			<a class="btn" href="/libraries/finish/<?=$library['libraryid']?>"><i class="fa fa-stop"></i> Stop de-duping</a>
			<a class="btn" href="#" data-dismiss="alert"><i class="fa fa-times-sign"></i> Not right now</a>
		</div>
	</div>
	<? } ?>

	<? if (!$references) { ?>
	<div class="alert alert-info">
		<h3><i class="fa fa-info-circle"></i> No references in this library</h3>
		<p>This library is empty. You can import references from a file or create new references manually.</p>
		<div class="pull-center">
			<a href="/libraries/import/<?=$library['libraryid']?>" class="btn"><i class="fa fa-cloud-upload"></i> Import library file</a>
		</div>
	</div>
	<? } else { ?>
	<? if ($tags) { ?>
	<ul class="nav nav-tabs" id="tag-filter">
		<li class="active"><a href="#" data-filterid="0"><i class="fa fa-asterisk"></i> All</a></li>
		<? foreach ($tags as $tag) { ?>
		<li><a href="#" data-filterid="<?=$tag['referencetagid']?>"><?=$tag['title']?></a></li>
		<? } ?>
		<li class="pull-right"><a href="/libraries/tags/<?=$library['libraryid']?>" data-tip="Manage library tags" data-tip-placement="left"><i class="fa fa-tags"></i></a></li>
	</ul>
	<? } ?>
	<table class="table table-striped table-bordered" id="reference-table">
		<tr>
			<th width="60px">&nbsp;</th>
			<th>Title</th>
			<th>Authors</th>
		</tr>
		<? foreach ($references as $reference) { ?>
		<tr rel="<?=$reference['referencetagid']?>">
			<td>
				<div class="dropdown">
					<a class="btn" data-toggle="dropdown"><i class="fa fa-tag"></i></a>
					<ul class="dropdown-menu">
						<li><a href="/references/edit/<?=$reference['referenceid']?>"><i class="fa fa-pencil"></i> Edit</a></li>
						<li class="divider"></li>
						<li><a href="/references/delete/<?=$reference['referenceid']?>"><i class="fa fa-trash-o"></i> Delete</a></li>
					</ul>
				</div>
			</td>
			<td><a href="/references/edit/<?=$reference['referenceid']?>"><?=$reference['title']?></a></td>
			<td>
				<a href="/references/edit/<?=$reference['referenceid']?>">
				<?
				$authorno = 0;
				if ($reference['authors']) {
					$authors = explode(' AND ', $reference['authors']);
					foreach ($authors as $author) {
						if ($authorno++ > 2) { ?>
							<span class="badge"><i class="fa fa-group"></i> + <?=count($authors) + 1 - $authorno?></span>
						<?
							break;
						} ?>
						<span class="badge badge-info"><i class="fa fa-user"></i> <?=$author?></span>
					<? } ?>
				<? } else { ?>
				<em>none</em>
				<? } ?>
				</a>
			</td>
		</tr>
		<? } ?>
	</table>
	<? } ?>

	<? if ($total && isset($offset) && isset($limit)) { // Display pager ?>
	<ul class="pager">
		<? if ($offset > 0) { ?>
		<li class="previous"><a href="<?=$this->URLopts->Edit('page=' . ($offset/$limit-1))?>">&larr;</a></li>
		<? } ?>
		Page <?=$offset/$limit+1?> of <?=round($total/$limit)?>
		<? if ($total >= $offset + $limit) { ?>
		<li class="next"><a href="<?=$this->URLopts->Edit('page=' . (($offset/$limit)+1))?>">&rarr;</a></li>
		<? } ?>
	</ul>
	<? } ?>
</div>

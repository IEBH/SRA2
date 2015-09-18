<legend>
	<?=$library['title']?>
	<div class="btn-group pull-right">
		<a class="btn dropdown-toggle" data-toggle="dropdown" href="#">
			<i class="fa fa-cog"></i> Tools <span class="caret"></span>
		</a>
		<ul class="dropdown-menu">
			<? $this->load->view('libraries/verbs', array('library' => $library)) ?>
		</ul>
	</div>
</legend>

<? if (!$tags) { ?>
<div class="alert alert-info">
	<h3><i class="fa fa-info-circle"></i> No tags for this library</h3>
	<p>There are no tags set up for this library</p>
</div>
<? } else { ?>
<table class="table table-striped table-bordered">
	<tr>
		<th width="60px">&nbsp;</th>
		<th>Tag</th>
		<th width="30px">References</th>
	</tr>
	<? foreach ($tags as $tag) {
		$tag['count'] = $this->Reference->Count(array('libraryid' => $library['libraryid'], 'status !=' => 'deleted', 'referencetagid' => $tag['referencetagid']))
	?>
	<tr>
		<td>
			<div class="dropdown">
				<a class="btn" data-toggle="dropdown"><i class="fa fa-tag"></i></a>
				<ul class="dropdown-menu">
					<li><a href="/libraries/tagdelete/<?=$library['libraryid']?>/<?=$tag['referencetagid']?>" data-confirm="Are you sure you want to delete this tag?"><i class="fa fa-trash-o"></i> Delete Tag</a></li>
				</ul>
			</div>
		</td>
		<td><a href="/libraries/view/<?=$library['libraryid']?>"><?=$tag['title']?></a></td>
		<td class="pull-center"><a href="/libraries/view/<?=$library['libraryid']?>" class="badge badge-info"><i class="fa fa-tag"></i> <?=$this->Format->Number($tag['count'])?></a></td>
	</tr>
	<? } ?>
</table>
<? } ?>
<div class="pull-center">
	<form class="form-inline" action="/libraries/tagadd/<?=$library['libraryid']?>" method="POST">
		<div class="input-append">
			<input type="text" name="name"/>
			<button class="btn" type="submit">Add tag</button>
		</div>
	</div>
</div>

<legend>
	Manage your libraries
	<div class="btn-group pull-right">
		<a class="btn dropdown-toggle" data-toggle="dropdown" href="#">
			<i class="fa fa-cog"></i> Tools <span class="caret"></span>
		</a>
		<ul class="dropdown-menu">
			<li><a href="/libraries/import"><i class="fa fa-cloud-upload"></i> Import references</a></li>
			<li><a href="/libraries/export"><i class="fa fa-cloud-download"></i> Export references</a></li>
			<li class="divider"></li>
			<li><a href="/libraries/dedupe"><i class="fa fa-compress"></i> Eliminate Duplicates</a></li>
			<li><a href="/libraries/screen"><i class="fa fa-filter"></i> Screen references</a></li>
		</ul>
	</div>
</legend>

<div ng-show="!libraries.length" class="alert alert-info">
	<div class="alert alert-info">
		<h3><i class="fa fa-info-circle"></i> No libraries found</h3>
		<p>You dont appear to have any reference libraries. You can import an existing library file or create new library manually.</p>
		<div class="pull-center">
			<a href="/libraries/import" class="btn"><i class="fa fa-cloud-upload"></i> Import file</a>
			&nbsp;
			<a href="/libraries/create" class="btn"><i class="fa fa-plus"></i> Manually create library</a>
		</div>
	</div>
</div>
<table ng-show="libraries.length" class="table table-striped table-bordered">
	<tr>
		<th width="60px">&nbsp;</th>
		<th>Title</th>
		<th width="100px">References</th>
	</tr>
	<tr ng-repeat="library in libraries">
		<td>
			<div class="dropdown">
				<a class="btn" data-toggle="dropdown"><i class="fa fa-tags"></i></a>
				<ul class="dropdown-menu" ng-include="'/partials/library-verbs.html'"></ul>
			</div>
		</td>
		<td><a href="/libraries/view/{{library.libraryid}}">{{library.title}}</a></td>
		<td><a href="/libraries/view/{{library.libraryid}}"><span class="badge badge-info"><i class="fa fa-tag"></i> {{library.itemCount | number}}</span></a></td>
	</tr>
</table>

<ul class="nav nav-list" data-selectbyurl="li" data-selectbyurl-parent="li">
	<li>
		<a href="/">
			<i class="fa fa-dashboard"></i> <span class="menu-text">Dashboard</span>
		</a>
	</li>

	<li>
		<a href="/search">
			<i class="fa fa-search"></i>
			<span class="menu-text"> Search</span>
		</a>
	</li>

	<li>
		<a href="/tools" class="dropdown-toggle">
			<i class="fa fa-wrench"></i>
			<span class="menu-text"> Tools</span>
			<b class="arrow fa fa-angle-down"></b>
		</a>
		<ul class="submenu">
			<li>
				<a href="/libraries/dedupe">
					<i class="fa fa-angle-double-right"></i> De-duplicate references
				</a>
			</li>
			<li>
				<a href="/libraries/screen">
					<i class="fa fa-angle-double-right"></i> Screen references
				</a>
			</li>
			<li>
				<a href="/libraries/collabmatrix">
					<i class="fa fa-angle-double-right"></i> Collaboration Matrix
				</a>
			</li>
		</ul>
	</li>

	<!-- <li>
		<a href="/how-to" class="dropdown-toggle">
			<i class="fa fa-book"></i>
			<span class="menu-text"> How to create a review</span>
			<b class="arrow fa fa-angle-down"></b>
		</a>
		<ul class="submenu">
			<? if (isset($this->Page)) { ?>
			<? foreach ($this->Page->GetSteps() as $i => $name) { ?>
			<li>
				<a href="/how-to/<?=$i+1?>">
					<i class="fa fa-angle-double-right"></i> <?=($i+1) . ". $name"?>
				</a>
			</li>
			<? } ?>
			<? } ?>
		</ul>
	</li> -->

	<?
	if (isset($this->Library, $this->User) && $this->User->GetActive()) {
		$basket = $this->Library->GetBasket();
	?>
	<li>
		<a href="/libraries" class="dropdown-toggle">
			<i class="fa fa-tags"></i>
			<span class="menu-text"> My libraries</span>
			<b class="arrow fa fa-angle-down"></b>
		</a>
		<ul class="submenu">
			<li><a href="/libraries"><i class="fa fa-angle-double-right"></i> View all</a></li>
			<? if ($basket) { // Move reference basket to top ?>
			<li>
				<a href="/libraries/view/<?=$basket['libraryid']?>">
					<i class="fa fa-angle-double-right"></i> <i class="fa fa-shopping-cart"></i> <?=$basket['title']?>
				</a>
			</li>
			<? } ?>
			<li ng-repeat="library in libraries">
				<a href="/libraries/view/{{library.libraryid}}">
					{{library.title}}
				</a>
			</li>
			<li><a href="/libraries/import">
				<i class="fa fa-plus"></i> Import New</a>
			</li>
		</ul>
	</li>
	<? } ?>
	<li>
		<a href="/help/getting-started">
			<i class="fa fa-question-circle"></i>
			<span class="menu-text"> Getting Started</span>
		</a>
	</li>

	<? if (isset($this->User) && !$this->User->GetActive()) { ?>
	<li>
		<a href="/login">
			<i class="fa fa-user"></i>
			<span class="menu-text"> Login</span>
		</a>
	</li>
	<? } ?>
</ul>

<div class="sidebar-collapse" id="sidebar-collapse">
	<i class="fa fa-angle-double-left"></i>
</div>
</div>

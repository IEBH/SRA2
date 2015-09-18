<!DOCTYPE HTML>
<html lang="en">
<? include('application/views/site/head.php') ?>

<body ng-app="app" ng-controller="globalController" class="navbar-fixed">
<div class="navbar navbar-fixed-top">
	<div class="navbar-inner">
		<div class="container-fluid">
			<a href="/" class="brand">
				<small><i class="fa fa-leaf"></i> <?=SITE_TITLE?></small>
			</a><!--/.brand-->

			<ul class="nav ace-nav pull-right">
				<?
				if (
					($basket = $this->Library->GetBasket())
					&& $basketitems = $this->Reference->GetAll(array('libraryid' => $basket['libraryid'], 'status' => 'active'))
				) {
				?>
				<li id="basket" class="grey">
					<a data-toggle="dropdown" class="dropdown-toggle" href="#">
						<i class="fa fa-shopping-cart"></i>
						<span class="badge badge-grey"><?=count($basketitems)?></span>
					</a>

					<ul class="pull-right dropdown-navbar dropdown-menu dropdown-caret dropdown-closer">
						<li class="nav-header">
							<i class="fa fa-shopping-cart"></i>
							<?=count($basketitems)?> items in search basket
						</li>

						<? for($i = 0; $i < min(count($basketitems), 10); $i++) {
							$item = $basketitems[$i];
						?>
						<li>
							<a href="/references/edit/<?=$item['referenceid']?>" class="clearfix">
								<span class="badge badge-info">WHO</span>
								<?=$item['title']?>
							</a>
						</li>
						<? } ?>
						<li>
							<div class="pad-bottom-small clearfix">
								<div class="btn-group pull-left">
									<a href="/libraries/clear/<?=$basket['libraryid']?>" class="btn btn-mini" data-confirm="Are you sure you wish to clear the search basket?"><i class="fa fa-trash-o"></i> Clear</a>
									<a href="/libraries/export/<?=$basket['libraryid']?>" class="btn btn-mini"><i class="fa fa-download"></i> Export</a>
								</div>
								<div class="btn-group pull-right">
									<a href="/libraries/view/<?=$basket['libraryid']?>" class="btn btn-mini"><i class="fa fa-arrow-right"></i> View All</a>
								</div>
							</div>
						</li>
					</ul>
				</li>
				<? } ?>

				<li class="light-blue">
					<? if (isset($this->User) && $this->User->GetActive()) { ?>
					<a data-toggle="dropdown" href="#" class="dropdown-toggle">
						<span class="user-info">
							<small>Welcome,</small> <?=$this->User->GetName(NULL, TRUE)?>
						</span>
						<i class="fa fa-caret-down"></i>
					</a>
					<ul class="user-menu pull-right dropdown-menu dropdown-yellow dropdown-caret dropdown-closer">
						<li><a href="/libraries"><i class="fa fa-tags"></i> My libraries</a></li>
						<li class="divider"></li>
						<li><a href="/password"><i class="fa fa-key"></i> Change password</a></li>
						<li><a href="/logout"><i class="fa fa-power-off"></i> Logout</a></li>
					</ul>
					<? } else { ?>
					<a href="/login"><i class="fa fa-user"></i> Login</a>
					<? } ?>
				</li>
			</ul><!--/.ace-nav-->
		</div><!--/.container-fluid-->
	</div><!--/.navbar-inner-->
</div>

<div class="main-container container-fluid">
	<a class="menu-toggler" id="menu-toggler" href="#">
		<span class="menu-text"></span>
	</a>

	<div class="sidebar fixed" id="sidebar">
		<div class="sidebar-shortcuts" id="sidebar-shortcuts">
			<div class="sidebar-shortcuts-large" id="sidebar-shortcuts-large">
				<a href="/how-to" class="btn btn-small btn-success" data-tip-placement="right" data-tip="How to create a systematic review">
					<i class="fa fa-book"></i>
				</a>

				<a href="/libraries" class="btn btn-small btn-info" data-tip-placement="right" data-tip="View your reference libraries">
					<i class="fa fa-tags"></i>
				</a>

				<a class="btn btn-small btn-warning">
					<i class="fa fa-group"></i>
				</a>

				<a href="/search" class="btn btn-small btn-danger" data-tip-placement="right" data-tip="Search for research papers">
					<i class="fa fa-search"></i>
				</a>
			</div>

			<div class="sidebar-shortcuts-mini" id="sidebar-shortcuts-mini">
				<span class="btn btn-success"></span>

				<span class="btn btn-info"></span>

				<span class="btn btn-warning"></span>

				<span class="btn btn-danger"></span>
			</div>
		</div>

		<? include('application/views/site/sidebar.php') ?>

		<div class="main-content">
			<div class="breadcrumbs" id="breadcrumbs">
				<ul class="breadcrumb">
					<li>
						<a href="/"><i class="fa fa-home home-icon"></i></a>
						<span class="divider"><i class="fa fa-angle-right arrow-icon"></i></span>
					</li>
					<? if (isset($breadcrumbs) && $breadcrumbs) { ?>
					<? foreach ($breadcrumbs as $link => $crumb) { ?>
					<li>
					<a href="<?=$link?>"><?=$crumb?></a>
					<span class="divider"><i class="fa fa-angle-right arrow-icon"></i></span>
					</li>
					<? } ?>
					<? } ?>
					<li><?=$title?></li>
				</ul><!--.breadcrumb-->

				<!--
				<div class="nav-search" id="nav-search">
					<form class="form-search">
						<span class="input-icon">
							<input type="text" placeholder="Search ..." class="input-small nav-search-input" id="nav-search-input" autocomplete="off" />
							<i class="fa fa-search nav-search-icon"></i>
						</span>
					</form>
				</div>
				-->
			</div>

			<div class="page-content">
				<div class="page-header position-relative">

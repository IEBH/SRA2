<div class="pad">
	<div class="hero-unit">
		<h1><?=SITE_TITLE?></h1>
		<p>Welcome to the CREBP Systematic Review Creator</p>
		<? if ($this->User->GetActive()) { // Logged in ?>
		<div class="pad-top-huge pull-center">
			<a class="btn btn-large" href="/help/getting-started"><i class="fa fa-book"></i> Getting started</a>
			<a class="btn btn-large" href="/libraries"><i class="fa fa-tags"></i> View your Libraries</a>
		</div>
		<? } else { // Not logged in ?>
		<div class="pad-top-huge pull-center">
			<a class="btn btn-large" href="/signup"><i class="fa fa-asterisk"></i> Create an account</a>
			<a class="btn btn-large" href="/login"><i class="fa fa-user"></i> Login</a>
		</div>
		<? } ?>
	</div>
</div>

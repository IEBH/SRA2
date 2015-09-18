<script>
$(function() {
	$('input[name=username]').select();
});
</script>
<body class="login-layout">
	<div class="main-container container-fluid">
		<div class="main-content">
			<div class="row-fluid">
				<div class="span12">
					<? if ($text) { ?>
					<div class="alert alert-info text-center pad">
						<h4><?=$text?></h4>
					</div>
					<? } ?>
					<div class="login-container">
						<div class="row-fluid">
							<div class="center">
								<h4>
									<i class="fa fa-leaf green"></i>
									<span class="white"><?=SITE_TITLE?></span>
								</h4>
							</div>
						</div>

						<div class="space-6"></div>

						<div class="row-fluid">
							<div class="position-relative">
								<div id="login-box" class="login-box visible widget-box no-border">
									<div class="widget-body">
										<div class="widget-main">
											<h4 class="header blue lighter bigger">
												<i class="fa fa-coffee green"></i>
												Please Enter Your Information
											</h4>

											<div class="space-6"></div>

											<form action="/login" method="post" novalidate>
												<fieldset>
													<label>
														<span class="block input-icon input-icon-right">
															Email address
															<input type="email" class="span12" value="<?=isset($_POST['username']) ? $_POST['username'] : ''?>" name="username" placeholder="someone@somewhere.com">
														</span>
													</label>

													<label>
														<span class="block input-icon input-icon-right">
															Password
															<input type="password" name="password" class="span12" placeholder="Your Password">
														</span>
													</label>

													<div class="space"></div>

													<div class="clearfix pull-center">
														<button type="submit" class="width-35 btn btn-small btn-primary">
															<i class="fa fa-key"></i>
															Login
														</button>
													</div>

													<div class="space-4"></div>
												</fieldset>
											</form>
										</div><!--/widget-main-->

										<div class="toolbar clearfix">
											<div>
												<a href="/recover/password" return false;" class="forgot-password-link">
													<i class="fa fa-arrow-left"></i>
													I forgot my password
												</a>
											</div>

											<div>
												<a href="/signup" onclick="show_box('signup-box'); return false;" class="user-signup-link">
													I want to register
													<i class="fa fa-arrow-right"></i>
												</a>
											</div>
										</div>
									</div><!--/widget-body-->
								</div><!--/login-box-->
							</div><!--/position-relative-->
						</div>
					</div>
				</div><!--/.span-->
			</div><!--/.row-fluid-->
		</div>
	</div><!--/.main-container-->
</body>

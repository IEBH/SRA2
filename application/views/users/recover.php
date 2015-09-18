<script>
$(function() {
	$('input[name=email]').select();
});
</script>
<body class="login-layout">
	<div class="main-container container-fluid">
		<div class="main-content">
			<div class="row-fluid">
				<div class="span12">
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

								<div id="forgot-box" class="forgot-box widget-box no-border visible">
									<div class="widget-body">
										<div class="widget-main">
											<h4 class="header red lighter bigger">
												<i class="fa fa-key"></i>
												Retrieve Password
											</h4>

											<div class="space-6"></div>
											<p>
												Enter your email and to receive instructions
											</p>

											<form action="/recover/password" method="post">
												<fieldset>
													<label>
														<span class="block input-icon input-icon-right">
															Email address
															<input type="email" name="email" class="span12"/>
														</span>
													</label>

													<div class="clearfix">
														<button type="submit" class="width-35 pull-right btn btn-small btn-danger">
															<i class="fa fa-lightbulb-o"></i>
															Send Me!
														</button>
													</div>
												</fieldset>
											</form>
										</div><!--/widget-main-->

										<div class="toolbar center">
											<a href="/login" class="back-to-login-link">
												Back to login
												<i class="fa fa-arrow-right"></i>
											</a>
										</div>
									</div><!--/widget-body-->
								</div><!--/forgot-box-->
							</div>
						</div>
					</div>
				</div><!--/.span-->
			</div><!--/.row-fluid-->
		</div>
	</div><!--/.main-container-->
</body>

<script>
$(function() {
	$('input[name=username]').select();
});
</script>
<div id="terms" class="modal hide fade">
	<div class="modal-header">
		<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
		<h3>User Agreement</h3>
	</div>
	<div class="modal-body">
<pre class="font-tiny">
<?=file_get_contents('LICENSE.txt')?>
</pre>
	</div>
	<div class="modal-footer">
		<a href="#" class="btn" data-dismiss="modal">Close</a>
	</div>
</div>
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
								<div id="signup-box" class="signup-box widget-box visible no-border">
									<div class="widget-body">
										<div class="widget-main">
											<h4 class="header green lighter bigger">
												<i class="fa fa-group blue"></i>
												New User Registration
											</h4>

											<div class="space-6"></div>
											<? if ($errs) { ?>
											<div class="alert alert-danger">
												<ul>
												<? foreach ($errs as $err) { ?>
													<li><?=$err?></li>
												<? } ?>
												</ul>
											</div>
											<? } else { ?>
											<p> Enter your details to begin: </p>
											<? } ?>
											<form method="POST" action="/signup">
												<fieldset>
													<label>
														<span class="block input-icon input-icon-right">
															First name
															<input type="text" name="fname" class="span12" value="<?=isset($_POST['fname'])?$_POST['fname']:''?>"/>
														</span>
													</label>

													<label>
														<span class="block input-icon input-icon-right">
															Last name
															<input type="text" name="lname" class="span12" value="<?=isset($_POST['lname'])?$_POST['lname']:''?>"/>
														</span>
													</label>

													<label>
														<span class="block input-icon input-icon-right">
															Email address
															<input type="email" name="email" class="span12" value="<?=isset($_POST['email'])?$_POST['email']:''?>"/>
														</span>
													</label>

													<label>
														<span class="block input-icon input-icon-right">
															Password
															<input type="password" name="password" class="span12" value="<?=isset($_POST['password'])?$_POST['password']:''?>"/>
														</span>
													</label>

													<label>
														<span class="block input-icon input-icon-right">
															Password confirm
															<input type="password" name="password2" class="span12" value="<?=isset($_POST['password2'])?$_POST['password2']:''?>"/>
														</span>
													</label>

													<label>
														<input type="checkbox" name="agree" <?=isset($_POST['agree'])?'checked="checked"':''?>/>
														<span class="lbl">
															I accept the
															<a href="#terms" data-toggle="modal" data-target="#terms">User Agreement</a>
														</span>
													</label>

													<div class="space-24"></div>

													<div class="clearfix">
														<button type="reset" class="width-30 pull-left btn btn-small">
															<i class="fa fa-refresh"></i>
															Reset
														</button>

														<button type="submit" class="width-65 pull-right btn btn-small btn-success">
															Register
															<i class="fa fa-arrow-right icon-on-right"></i>
														</button>
													</div>
												</fieldset>
											</form>
										</div>

										<div class="toolbar center">
											<a href="/login" class="back-to-login-link">
												<i class="fa fa-arrow-left"></i>
												Back to login
											</a>
										</div>
									</div><!--/widget-body-->
								</div><!--/signup-box-->
							</div><!--/position-relative-->
						</div>
					</div>
				</div><!--/.span-->
			</div><!--/.row-fluid-->
		</div>
	</div><!--/.main-container-->
</body>

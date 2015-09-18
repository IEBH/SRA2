<?
define('SITE_ROOT', '/');
$defaultLeft = array(
	'whooping cough',
	'mumps',
	'influenza',
	'laryngitis',
	'maxillary sinusitis',
	'measles',
	'sore throat',
	'pneumonia',
	'common cold',
);
$defaultRight = array(
	'antihistamines',
	'acellular vaccines',
	'acetylcysteine',
	'acyclovir',
	'carbocysteine',
	'antibiotics',
	'chinese medicinal herbs',
);
?>
<!DOCTYPE html>
<html lang="en-US">
<meta charset="utf-8">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<head><title>Cochrane ARI</title></head>
<!-- jQuery -->
<script src="<?=SITE_ROOT?>lib/jquery/jquery-1.8.3.min.js"></script>

<!-- Bootstrap -->
<link href="<?=SITE_ROOT?>lib/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css"/>
<link href="<?=SITE_ROOT?>lib/bootstrap/css/bootstrap-responsive.min.css" rel="stylesheet" type="text/css"/>
<script src="<?=SITE_ROOT?>lib/bootstrap/js/bootstrap.min.js"></script>
<script src="jquery-ui.js"></script>
<script>
function colorLeft()
{
	var tempLeft =  $('#yj').val();
	html = document.getElementById("content").innerHTML;
	var reg = /^[0-9a-zA-Z ]+$/;
	html =html.replace(/<\/?span[^>]*>/gi,'');
	var str = tempLeft.replace(/\n/g, "|");
	var keys = str.split('|');
	for (var i=0; i<keys.length; i++) {
		if(reg.test(keys[i])) {
			html = html.replace(new RegExp(keys[i], 'ig'), "<span class='badge badge-warning'>" + keys[i]+ "</span>");
		}
	}
	document.getElementById("content").innerHTML=html;
	var tempRight = $('#yq').val();
	html = document.getElementById("content").innerHTML;
	if(tempRight != '') {
		var str = tempRight.replace(/\n/g, "|");
		var keys = str.split('|');
		for (var i=0; i<keys.length; i++) {
			if(reg.test(keys[i])) {
				html = html.replace(new RegExp(keys[i], 'ig'), "<span class='badge badge-info'>" + keys[i]+ "</span>");
			}
		}
		document.getElementById("content").innerHTML=html;
	}
}
function colorRight()
 {
	var tempRight = $('#yq').val();
	html = document.getElementById("content").innerHTML;
	var reg = /^[0-9a-zA-Z ]+$/;
	html =html.replace(/<\/?span[^>]*>/gi,'');
	var str = tempRight.replace(/\n/g, "|");
	var keys = str.split('|');
	for (var i=0; i<keys.length; i++) {
		if(reg.test(keys[i])) {
			html = html.replace(new RegExp(keys[i], 'ig'), "<span class='badge badge-info'>" + keys[i]+ "</span>");
		}
	}
	document.getElementById("content").innerHTML=html;
	var tempLeft = $('#yj').val();
	html = document.getElementById("content").innerHTML;
	if(tempLeft != '') {
		var str = tempLeft.replace(/\n/g, "|");
		var keys = str.split('|');
		for (var i=0; i<keys.length; i++) {
			if(reg.test(keys[i])) {
				html = html.replace(new RegExp(keys[i], 'ig'), "<span class='badge badge-warning'>" + keys[i]+ "</span>");
			}
		}
		document.getElementById("content").innerHTML=html;
	}
}


function disableEnter(event){
	var keyCode = event.keyCode?event.keyCode:event.which?event.which:event.charCode;
	if (keyCode ==13){
		colorLeft();
		colorRight();
	}
}

$(function() {
	$('#yj').on('change blur', colorLeft);
	$('#yq').on('change blur', colorRight);
	$('#yj, #yq').on('keydown', function() {
		return disableEnter(event);
	});
	colorLeft(); colorRight();
});
</script>
<style>
.container-fluid {
}
#content {
	margin-left: 35px;
}
</style>
<body>
	<div class="container-fluid">
		<div class="row" style="height: 500px; overflow: auto">
			<div id="content" class="span12">
				<?php
					$handle = fopen('data.csv', 'r');
					while ($line = fgets($handle))
						echo rtrim($line) . "<br/>\n";
					fclose($handle);
				?>
			</div>
		</div>
		<div class="row">
			<div style="width: 45%; float: left; margin-left: 35px">
				<textarea name="yj" id= "yj" style="height:100%;width:100%" rows="5"><?=implode("\n", $defaultLeft)?></textarea>
			</div>
			<div style="width: 45%; float: right; margin-right: 35px">
				<textarea name="yq" id= "yq" style="height:100%;width:495%;" rows="5"><?=implode("\n", $defaultRight)?></textarea>
			</div>
		</div>
	</div>
</body>

</html>


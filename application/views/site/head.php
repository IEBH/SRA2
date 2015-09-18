<? if (!isset($this->site)) die('Error') ?>
<head>
	<meta charset="utf-8">
	<title><?=SITE_TITLE?> | <?=$title?></title>
	<link rel="icon" type="image/png" href="/img/favicon.png">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<!-- jQuery -->
	<script src="/lib/jquery/jquery-1.8.3.min.js"></script>

	<!-- Bootstrap -->
	<link href="/lib/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css"/>
	<link href="/lib/bootstrap/css/bootstrap-responsive.min.css" rel="stylesheet" type="text/css"/>
	<script src="/lib/bootstrap/js/bootstrap.min.js"></script>

	<!-- FontAwesome -->
	<link rel="stylesheet" href="/bower_components/fontawesome/css/font-awesome.min.css">

	<!-- Livicons -->
	<script src="/lib/livicons/raphael-min.js"></script>
	<script src="/lib/livicons/livicons-1.3.min.js"></script>
	<!--[if lt IE 8]>
		<script src="/lib/livicons/json2.min.js"></script>
	<![endif]-->

	<!-- Shoelace -->
	<link href="/bower_components/shoelace/shoelace.css" rel="stylesheet" type="text/css"/>
	<script src="/bower_components/shoelace/shoelace.js"></script>

	<!-- Angular -->
	<script src="/bower_components/angular/angular.min.js"></script>
	<script src="/bower_components/angular-resource/angular-resource.min.js"></script>

	<!-- lodash -->
	<script src="/bower_components/lodash/dist/lodash.min.js"></script>

	<!-- Site style -->
	<link href="/css/global.css" rel="stylesheet">
	<link rel="stylesheet" href="/css/print.css" media="print">
	<link rel="stylesheet" href="/css/ace-fonts.css" />

	<link rel="stylesheet" href="/css/ace.min.css" />
	<link rel="stylesheet" href="/css/ace-responsive.min.css" />

	<script src="/js/ace-elements.min.js"></script>
	<script src="/js/ace.min.js"></script>

	<!-- Angular app -->
	<?=$this->site->includeNG()?>

	<!--[if lte IE 8]>
		<link rel="stylesheet" href="//css/ace-ie.min.css" />
	<![endif]-->

	<!-- Site core -->
	<script src="/js/core.js"></script>

	<!-- for IE6-8 support of HTML5 elements -->
	<!--[if lt IE 9]>
		<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
	<![endif]-->

	<!-- Favicons {{{ -->
	<link rel="shortcut icon" href="http://crebp-sra.com/img/icons/favicon.ico?v=2" />
	<link rel="apple-touch-icon-precomposed" sizes="57x57" href="http://crebp-sra.com/img/icons/apple-touch-icon-57x57.png" />
	<link rel="apple-touch-icon-precomposed" sizes="114x114" href="http://crebp-sra.com/img/icons/apple-touch-icon-114x114.png" />
	<link rel="apple-touch-icon-precomposed" sizes="72x72" href="http://crebp-sra.com/img/icons/apple-touch-icon-72x72.png" />
	<link rel="apple-touch-icon-precomposed" sizes="144x144" href="http://crebp-sra.com/img/icons/apple-touch-icon-144x144.png" />
	<link rel="apple-touch-icon-precomposed" sizes="60x60" href="http://crebp-sra.com/img/icons/apple-touch-icon-60x60.png" />
	<link rel="apple-touch-icon-precomposed" sizes="120x120" href="http://crebp-sra.com/img/icons/apple-touch-icon-120x120.png" />
	<link rel="apple-touch-icon-precomposed" sizes="76x76" href="http://crebp-sra.com/img/icons/apple-touch-icon-76x76.png" />
	<link rel="apple-touch-icon-precomposed" sizes="152x152" href="http://crebp-sra.com/img/icons/apple-touch-icon-152x152.png" />
	<link rel="icon" type="image/png" href="http://crebp-sra.com/img/icons/favicon-196x196.png" sizes="196x196" />
	<link rel="icon" type="image/png" href="http://crebp-sra.com/img/icons/favicon-96x96.png" sizes="96x96" />
	<link rel="icon" type="image/png" href="http://crebp-sra.com/img/icons/favicon-64x64.png" sizes="64x64" />
	<link rel="icon" type="image/png" href="http://crebp-sra.com/img/icons/favicon-48x48.png" sizes="48x48" />
	<link rel="icon" type="image/png" href="http://crebp-sra.com/img/icons/favicon-32x32.png" sizes="32x32" />
	<link rel="icon" type="image/png" href="http://crebp-sra.com/img/icons/favicon-24x24.png" sizes="24x24" />
	<link rel="icon" type="image/png" href="http://crebp-sra.com/img/icons/favicon-16x16.png" sizes="16x16" />
	<link rel="icon" type="image/png" href="http://crebp-sra.com/img/icons/favicon-128x128.png" sizes="128x128" />
	<meta name="msapplication-square70x70logo" content="http://crebp-sra.com/img/icons/mstile-70x70.png" />
	<meta name="msapplication-square150x150logo" content="http://crebp-sra.com/img/icons/mstile-150x150.png" />
	<meta name="msapplication-wide310x150logo" content="http://crebp-sra.com/img/icons/mstile-310x150.png" />
	<meta name="msapplication-square310x310logo" content="http://crebp-sra.com/img/icons/mstile-310x310.png" />
	<meta name="application-name" content="CREBP Systematic Review Assistant"/>
	<meta name="msapplication-TileColor" content="#393939"/>
	<!-- }}} -->
</head>

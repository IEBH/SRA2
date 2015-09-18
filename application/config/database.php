<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
$active_group = 'default';
$active_record = TRUE;

if (preg_match('/crebp\.net\.au$/', $_SERVER['SERVER_NAME'])) {
	$db['default']['hostname'] = 'localhost';
	$db['default']['database'] = 'cre21534_sra';
	$db['default']['username'] = 'cre21534_sra';
	$db['default']['password'] = 'u35K9gxDmpdw';
} elseif (preg_match('/crebp-sra\.com$/', $_SERVER['SERVER_NAME'])) {
	$db['default']['hostname'] = 'localhost';
	$db['default']['database'] = 'crebp_sra';
	$db['default']['username'] = 'crebp_sra';
	$db['default']['password'] = 'moojiew7Otue6eo';
} else {
	$db['default']['hostname'] = 'localhost';
	$db['default']['database'] = 'sra';
	$db['default']['username'] = 'mc';
	$db['default']['password'] = '';
}
$db['default']['dbdriver'] = 'mysql';
$db['default']['dbprefix'] = '';
$db['default']['pconnect'] = TRUE;
$db['default']['db_debug'] = TRUE;
$db['default']['cache_on'] = FALSE;
$db['default']['cachedir'] = '';
$db['default']['char_set'] = 'utf8';
$db['default']['dbcollat'] = 'utf8_general_ci';
$db['default']['swap_pre'] = '';
$db['default']['autoinit'] = TRUE;
$db['default']['stricton'] = FALSE;

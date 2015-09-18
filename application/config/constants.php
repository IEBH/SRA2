<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
// CodeIgniter constants {{{
/*
|--------------------------------------------------------------------------
| File and Directory Modes
|--------------------------------------------------------------------------
|
| These prefs are used when checking and setting modes when working
| with the file system.  The defaults are fine on servers with proper
| security, but you may wish (or even need) to change the values in
| certain environments (Apache running a separate process for each
| user, PHP under CGI with Apache suEXEC, etc.).  Octal values should
| always be used to set the mode correctly.
|
*/
define('FILE_READ_MODE', 0644);
define('FILE_WRITE_MODE', 0666);
define('DIR_READ_MODE', 0755);
define('DIR_WRITE_MODE', 0777);

/*
|--------------------------------------------------------------------------
| File Stream Modes
|--------------------------------------------------------------------------
|
| These modes are used when working with fopen()/popen()
|
*/

define('FOPEN_READ',							'rb');
define('FOPEN_READ_WRITE',						'r+b');
define('FOPEN_WRITE_CREATE_DESTRUCTIVE',		'wb'); // truncates existing file data, use with care
define('FOPEN_READ_WRITE_CREATE_DESTRUCTIVE',	'w+b'); // truncates existing file data, use with care
define('FOPEN_WRITE_CREATE',					'ab');
define('FOPEN_READ_WRITE_CREATE',				'a+b');
define('FOPEN_WRITE_CREATE_STRICT',				'xb');
define('FOPEN_READ_WRITE_CREATE_STRICT',		'x+b');
// }}}

define('VERSION', '0.1.0');

define('SITE_TITLE', 'CREBP Systematic Review Assistant');
define('SITE_DOMAIN', 'crebp.net.au');
define('SITE_URL', 'http://crebp.net.au/sra');

define('BASKET_NAME', 'Reference Basket');

// De-duplication options
define('DEDUPE_ORDERBY', 'referenceid'); // What to order references by
define('DEDUPE_MAX_TIME', 4); // Maximum  amount of time (seconds) to let the process run
define('DEDUPE_SCOOP_REFERENCES', 10); // Number of references to read into memory at once to analyze (i.e. ref A)
define('DEDUPE_SCOOP_REFERENCES2', 50); // Number of secondary references to read into memory at once to analyze (i.e. ref A <=> B)

// Screening options
define('SCREEN_LIMIT', 10); // How many references per page

// Email switches
define('EMAIL_ADDRESS', 'noreply@crebp-sra.com');
define('EMAIL_NAME', 'CREBP-SRA'); // The human name of the EMAIL_ADDRESS
define('EMAIL_OVERRIDE', 0); // If enabled all outgoing mail will sent to EMAIL_OVERRIDE_TO
define('EMAIL_OVERRIDE_TO', 'matt_carter@bond.edu.au');
define('EMAIL_OVERRIDE_NAME', 'Matt Carter');

// Server details
// define('EMAIL_SERVER_HOSTNAME', 'localhost');
// define('EMAIL_SERVER_PORT', 25);
// define('EMAIL_SERVER_USER', 'smtp@localhost');
// define('EMAIL_SERVER_PASS', '');
require('application/config/constants-private.php'); // Pull from private file (so its not checked in to GitHub)

define('URLPAYLOAD_DEFAULT_EXPIRY', strtotime('+3 days'));
define('URLPAYLOAD_URL', SITE_URL . '/go/[CODE]');

<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
$route['default_controller'] = "pages";
$route['404_override'] = '';

$route['designer'] = 'pages/designer';

$route['login'] = 'users/login';
$route['login/(:any)'] = 'users/login/$1';
$route['logout'] = 'users/logout';
$route['signup'] = 'users/signup';
$route['recover'] = 'users/recover';
$route['password'] = 'users/password';
$route['recover/(:any)'] = 'users/recover';
$route['help/(:any)'] = 'pages/show/$1';

$route['how-to'] = 'pages/howto';
$route['how-to/(:any)'] = 'pages/howto/$1';

// Search modules
$route['search/(:any)'] = '$1';

// TinyURL handler
$route['go/(:any)'] = 'tinyurls/view/$1';

// Simple page aliases

// Rewrite API prefix to URLS - /api/$controller/$method -> /$controller/JSON{$method}
$route['api/(:any)/(:any)'] = '$1/JSON$2';

// Work around PHP's stupid stipulation that List() is a reserved word
// */list -> #/index
$route['(:any)/list'] = '$1/index';
$route['(:any)/list/(:any)'] = '$1/index/$2';

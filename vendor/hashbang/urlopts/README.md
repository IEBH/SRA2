URLopts - CodeIgniter pretty URL option processing
==================================================
This library provies a simple way to setup nice looking URLs.

URLopts encodes various parameters into the URL string itself similar to a normal GET parameter but in a neater way.

For example the following URL shows the various components of a neatened URL:

	http://website.com/controller/function/parameter1/value1/parameter2/value2/parameter3/value3

URLopts provides a library for constructing and reading back URLs such as this within a CodeIgniter controller.

Installation
============
Download this repo and copy into your application directory.

Alternatively, install with [Composer](http://getcomposer.org).

Examples
========

CodeIgniter Controller
----------------------

Here is a simple User controler which is showing a list of users.

This function allows you to pass various parameters in the URL to filter the user list.

For example the following URLs can be used

* `http://website.com/users/list` - The basic list - show everything
* `http://website.com/users/list/page/5` - Move to page 5 (e.g. if using pagination)
* `http://website.com/users/list/newsletter/yes` - Only show users who are signed up to the newsletter
* `http://website.com/users/list/role/admin` - Only show 'admin' users
* `http://website.com/users/list/recent/yes` - Only show users who have logged in recently
* `http://website.com/users/list/page/5/newsletter/yes` - A combination of only showing page 5 + users subscribed to the newsletter
* `http://website.com/users/list/role/admin/recent/yes` - Another combination showing only 'admin' users who have loggged in recently
* All of the above can be combined in any combination.

The example CodeIgniter controller would look something like this:

	<?
	class Users extends CI_Controller {

		function List() {
			$this->URLopts = new URLopts();

			// Setup various DB query parameters
			$offset = 0;
			$limit = 30;
			$where = array();

			$params = $this->URLopts->Get(); // Process this URL into an accessible array object of parameters

			if (isset($params['page'])) // Are we asking for a specific page (e.g. http://website.com/users/list/page/5)
				$offset = $limit * $params['page'];

			if (isset($params['newsletter']) && $params['newsletter']) // Are we only interested in users subscribed to a newsletter (e.g. http://website.com/users/list/newsletter/yes)
				$where['newsletter'] = 1;

			if (isset($params['role']) && $params['role']) // Are we only interested in users with a specific role (e.g. http://website.com/users/list/role/admin)
				$where['role'] = $params['role'];

			if (isset($params['recent']) && $params['recent']) // Are we only interested in users who have logged in recently (e.g. http://website.com/users/list/recent/yes)
				$where['lastlogin >='] = strtotime('-1 ' . $params['recent']);

			$this->load->view('users/header');
			$this->load->view('users/list', array(
				'users' => $this->User->GetAll($where, $limit, $offset), // This assumes you have a 'User' model with the function 'GetAll()'
				'limit' => $limit,
				'offset' => $offset,
				'params' => $params,
			));
			$this->load->view('users/footer');
		}
	}


CodeIgniter Views
-----------------
This library also provides ways to return a URL with various options turned off/on.

For example these functions can be placed in your view to return the current URL again with various options set:

	<?=$this->URLopts->Edit('foo=bar')?>

The above sets 'foo' to 'bar' in the URL. If the current URL was 'http://website.com/users/list' the above would return 'http://website.com/users/list/foo/bar'.

	<?=$this->URLopts->Edit('+foo')?>

The above sets 'foo' to '1' in the URL. If the current URL was 'http://website.com/users/list' the above would return 'http://website.com/users/list/foo/1'.

	<?=$this->URLopts->Edit('-foo')?>

The above removes 'foo' from the URL. If the current URL was 'http://website.com/users/list/foo/bar' the above would return 'http://website.com/users/list'.

An alternate syntax is also available:

	<?=$this->URLopts->Add('foo', 'bar')?>

	<?=$this->URLopts->Remove('foo')?>

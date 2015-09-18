<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class Pages extends CI_Controller {
	function Index() {
		$this->site->header(SITE_TITLE);
		$this->load->view('pages/index');
		$this->site->footer();
	}

	function Show($page = null) {
		$args = func_get_args();
		$code = $args ? implode('/', $args) : ltrim($_SERVER['REQUEST_URI'], '/');

		$titles = array( // Special case titles
		);
		$title = isset($titles[$code]) ? $titles[$code] : ucfirst($code);

		if (file_exists("application/views/pages/$code.php")) {
			$this->site->Header(isset($titles[$code]) ? $titles[$code] : ucfirst($code));
			$this->site->View('pages/' . $code);
			$this->site->Footer();
		} else { // Give up
			$this->Error404();
			return;
		}
	}

	/**
	* Special case for the how-to pages so we calculate the breadcrumb trail correctly
	* Files are pulled from views/pages/how-to/$page.php or views/pages/how-to.php if no $page
	* @param int $page The specific step to show
	*/
	function HowTo($page = null) {
		$this->load->model('Page');
		$steps = $this->Page->GetSteps();

		if ($page) { // Referencing a specific page
			if (!isset($steps[$page]))
				return $this->Error404();
			$this->site->Header($steps[$page], array(
				'breadcrumbs' => array(
					'/how-to' => 'How to create a review',
				),
			));
			$this->site->View("pages/how-to/$page.php");
			$this->site->Footer();
		} else { // Reference main page
			$this->site->Header('How to create a review');
			$this->site->View('pages/how-to');
			$this->site->Footer();
		}
	}

	function Error404() {
		$heading = "404 Page not Found";
		$message = "The page you requested cannot be found";
		require('application/errors/error_404.php');
	}
}

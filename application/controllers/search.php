<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class Search extends CI_Controller {
	function __construct() {
		parent::__construct();
		$this->load->model('Searchwho');
		$this->load->model('Basket');
	}

	function Index() {
		$this->Security->EnsureLogin();

		if (!isset($_REQUEST['q']))
			$_REQUEST['q'] = null;

		$this->site->Header('Citation Search');
		$this->site->view('search/search', array(
			'papers' => $_REQUEST['q'] ? $this->Searchwho->GetAll($_REQUEST['q']) : null,
		));
		$this->site->Footer();
	}
}

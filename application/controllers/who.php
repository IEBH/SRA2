<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class Who extends CI_Controller {
	function __construct() {
		parent::__construct();
		$this->load->model('Searchwho');
		$this->load->model('Basket');
	}

	function Index() {
		$this->site->Redirect('/search');
	}

	function Paper($ref = null) {
		$args = func_get_args();
		$ref = implode('/', $args);
		if (!$ref)
			$this->site->redirect('/');
		if (!$paper = $this->Searchwho->Get($ref))
			$this->Site->Error("Cannot find paper with reference $ref");
		// Waveform config {{{
		$this->Waveform = new Waveform();
		$this->Waveform->Style('bootstrap');

		$this->Waveform->Define('title-public')
			->Title('Public Title');
		$this->Waveform->Define('title-scientific')
			->Title('Scientific Title');
		$this->Waveform->Define('url-who')
			->Title('URL (WHO site)');
		$this->Waveform->Define('url-real')
			->Title('URL');
		$this->Waveform->Define('contact-name')
			->Title('Contact Name');
		$this->Waveform->Define('contact-email')
			->Title('Contact Email');
		$this->Waveform->Define('register');
		$this->Waveform->Define('date-refresh')
			->Title('Last refreshed on');
		$this->Waveform->Define('date-reg')
			->Title('Date of registration');
		$this->Waveform->Define('date-enrolment')
			->Title('Date of first enrolment');
		$this->Waveform->Define('sponsor')
			->Title('Primary Sponsor');
		$this->Waveform->Define('target-size')
			->Title('Target sample size');
		$this->Waveform->Define('recruitment-status')
			->Title('Recruitment status');
		$this->Waveform->Define('study-type')
			->Title('Study type');
		$this->Waveform->Define('study-design')
			->Title('Study design');
		$this->Waveform->Define('primary-outcomes')
			->Title('Primary Outcomes');

		$this->Waveform->Set($paper);
		$this->Waveform->Apply('readonly');
		$this->Waveform->Apply('link', 'url-who, url-real');
		// }}}

		if (preg_match('/(search\?q=.*)$/', $_SERVER['HTTP_REFERER'], $matches)) {
			$breadcrumbs = array('/' . $matches[1] => 'Search');
		} else {
			$breadcrumbs = array('/search' => 'Search');
		}

		$this->site->Header($ref, array('breadcrumbs' => $breadcrumbs));
		$this->site->view('who/paper', array(
			'paper' => $paper,
		));
		$this->site->Footer();
	}

	/**
	* Add the given WHO reference to the search basket
	* @param string,...|array $_REQUEST['refs']|$refs The reference or references to add
	*/
	function Add($refs = null) {
		$this->load->model('Library');
		$this->load->model('Reference');

		if (isset($_REQUEST['refs'])) {
			$refs = (array) $_REQUEST['refs'];
		} else {
			$args = func_get_args();
			$refs = array(implode('/', $args));
		}

		if (!$refs)
			$this->site->redirect('/');

		$basket = $this->Library->GetBasket(TRUE);

		foreach ($refs as $ref) {
			if (!$paper = $this->Searchwho->Get($ref))
				$this->Site->Error("Cannot find paper with reference $ref");
			if ($this->Reference->GetByYourRef("who-{$paper['ref']}", $basket['libraryid'])) // Already in basket - skip
				continue;

			$data = $paper;
			// Translate WHO -> EndNote {{{
			unset($data['title']);
			$data['date'] = $data['date-reg'];
			// }}}
			$this->Reference->Create(array(
				'libraryid' => $basket['libraryid'],
				'title' => $paper['title'],
				'authors' => $paper['contact-name'],
				'data' => $data,
				'yourref' => 'who-' . $paper['ref'],
			));
		}

		$this->site->RedirectBack('/search');
	}

	/**
	* Remove the given WHO reference from the search basket
	* @param string,...|array $_REQUEST['refs']|$refs The reference or references to remove
	*/
	function Remove($refs = null) {
		$this->load->model('Library');
		$this->load->model('Reference');

		if (isset($_REQUEST['refs'])) {
			$refs = (array) $_REQUEST['refs'];
		} else {
			$args = func_get_args();
			$refs = array(implode('/', $args));
		}

		if (!$refs)
			$this->site->redirect('/');
		$basket = $this->Library->GetBasket(TRUE);

		foreach ($refs as $ref) {
			if (!$paper = $this->Searchwho->Get($ref))
				$this->Site->Error("Cannot find paper with reference $ref");

			if ($paper = $this->Reference->GetByYourRef("who-$ref", $basket['libraryid']))
				$this->Reference->SetStatus($paper['referenceid'], 'deleted');
		}

		$this->site->RedirectBack('/search');
	}
}

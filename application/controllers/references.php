<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class References extends Joyst_Controller {
	function __construct() {
		parent::__construct();
		$this->load->model('Reference');
		$this->JoystModel('Reference');
	}

	function Index() {
		$this->load->model('Basket');
		$this->site->Header('References');
		$this->site->view('references/list', array(
			'papers' => $this->Basket->GetAll(),
		));
		$this->site->Footer();
	}

	function Clear() {
		$this->Basket->Clear();
		$this->site->RedirectBack();
	}

	function Raw($referenceid = null) {
		if (!$reference = $this->Reference->Get($referenceid))
			$this->site->Error('Invalid reference - ' . $this->Reference->joystError);
		print_r($reference);
	}

	function Edit($referenceid = null) {
		$this->load->model('Library');

		if (!$reference = $this->Reference->Get($referenceid))
			$this->site->Error('Invalid reference - ' . $this->Reference->joystError);
		if (!$library = $this->Library->Get($reference['libraryid']))
			$this->site->Error('Invalid parent library');

		// FIXME: Temporary kludge to make the reference viewer actually do something useful for WHO papers
		if ($reference['yourref'] && preg_match('/^who-(.*)$/', $reference['yourref'], $matches))
			$this->site->Redirect("/search/who/paper/{$matches[1]}");

		$this->site->Header("Reference #$referenceid", array(
			'breadcrumbs' => array(
				'/libraries' => 'My References',
				"/libraries/view/{$library['libraryid']}" => $library['title'],
			),
		));
		$this->site->view('references/edit', array(
			'library' => $library,
			'reference' => $reference,
		));
		$this->site->Footer();
	}

	function Delete($referenceid = null) {
		if (!$reference = $this->Reference->Get($referenceid))
			$this->site->Error('Invalid reference');
		$this->Reference->Save($referenceid, array('status' => 'deleted'));
		$this->site->Redirect("/libraries/view/{$reference['libraryid']}");
	}

	function Export() {
		if (!$references = $this->Basket->GetAll())
			$this->Site->Error('No references to export');

		require('lib/php-endnote/endnote.php');
		$this->endnote = new PHPEndNote();

		foreach ($references as $refno => $ref) {
			$out = array(
				'author' => $ref['ref'],
				'address' => $ref['contact-name'] . ($ref['contact-email'] ? ' - ' . $ref['contact-email'] : ''),
				'title' => $ref['title'],
				'title-short' => $ref['title-scientific'],
				'date' => $ref['date-reg'],
				'abstract' => $ref['primary-outcomes'],
				'url' => $ref['url-real'],
				'notes' => 'STUDY TYPE' . "\n" . $ref['study-type'] . "\n\nSTUDY DESIGN\n" . $ref['study-design'],
			);
			foreach (array('title-secondary', 'title-short', 'periodical-title', 'pages', 'volume', 'number', 'section', 'year', 'abstract', 'notes', 'research-notes', 'isbn', 'label', 'caption', 'language', 'custom1', 'custom2', 'custom3', 'custom4', 'custom5', 'custom6', 'custom7') as $f)
				if (isset($ref[$f]))
					$out[$f] = $ref[$f];
			$this->endnote->Add($out);
		}
		echo $this->endnote->GetXML();
	}
}

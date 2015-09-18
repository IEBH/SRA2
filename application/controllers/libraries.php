<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class Libraries extends Joyst_Controller {
	function __construct() {
		parent::__construct();
		$this->Security->EnsureLogin();
		$this->load->model('Library');
		$this->JoystModel('Library');
	}

	function Index() {
		$this->site->header('Manage your libraries');
		$this->load->view('libraries/list', array(
			'libraries' => $this->Library->GetAll(array('userid' => $this->User->GetActive('userid'), 'status !=' => 'deleted')),
		));
		$this->site->footer();
	}

	function View($libraryid = null) {
		if (!$library = $this->Library->Get($libraryid))
			$this->site->Error('Invalid library');
		if (!$this->Library->CanEdit($library))
			$this->site->Error('You do not have access to this library');

		$offset = 0;
		$limit = 50;
		$where = array(
			'libraryid' => $library['libraryid'],
			'status !=' => 'deleted',
		);

		$this->URLopts = new URLopts();
		$params = $this->URLopts->Get(null, 2);
		if (isset($params['page']))
			$offset = $limit * $params['page'];

		$this->site->header($library['title'], array(
			'breadcrumbs' => array(
				'/libraries' => 'Libraries'
			),
		));
		$this->load->view('libraries/view', array(
			'offset' => $offset,
			'limit' => $limit,
			'total' => $this->Reference->Count($where),
			'library' => $library,
			'references' => $this->Reference->GetAll($where, 'title', $limit, $offset),
			'tags' => $this->Library->GetAllTags($library['libraryid']),
		));
		$this->site->footer();
	}

	function Edit($libraryid = null) {
		if (!$library = $this->Library->Get($libraryid))
			$this->site->Error('Invalid library');
		if (!$this->Library->CanEdit($library))
			$this->site->Error('You do not have access to this library');

		$this->site->header("Edit {$library['title']}", array(
			'breadcrumbs' => array(
				'/libraries' => 'Libraries'
			),
		));
		$this->load->view('libraries/edit', array(
			'library' => $library,
		));
		$this->site->footer();
	}

	function Share($libraryid = null) {
		$this->load->model('Email');
		$this->load->model('Reference');
		$this->load->model('Urlpayload');
		if (!$library = $this->Library->Get($libraryid))
			$this->site->Error('Invalid library');
		if (!$this->Library->CanEdit($library))
			$this->site->Error('You do not have access to this library');

		// Waveform config {{{
		$this->Waveform = new Waveform();
		$this->Waveform->Style('bootstrap');
		
		$this->Waveform->Define('email')
			->Title('Email address')
			->Email()
			->Style('class', 'input-block-level');
		// }}}

		if ($this->Waveform->OK()) {
			$this->Email->SendEmail('libraries/share', $this->Waveform->Fields['email'], array(
				'library.name' => $library['title'],
				'library.references' => $this->Reference->Count(array('libraryid' => $library['libraryid'])),
				'share.url' => $this->Urlpayload->Create(array(
					'command' => 'share',
					'payloadid' => $library['libraryid'],
					'expiry' => strtotime('+3 days'),
				)),
			));
			$this->site->header("Share {$library['title']}", array(
				'breadcrumbs' => array(
					'/libraries' => 'Libraries'
				),
			));
			$this->load->view('libraries/share/complete', array(
				'library' => $library,
				'email' => $fields['email'],
			));
			$this->site->footer();
		} else { 
			$this->site->header("Share {$library['title']}", array(
				'breadcrumbs' => array(
					'/libraries' => 'Libraries'
				),
			));
			$this->load->view('libraries/share/index', array(
				'library' => $library,
			));
			$this->site->footer();
		}
	}

	function Screen($libraryid = null, $method = null, $page = 1) {
		$library = null;
		if ($libraryid) { // Specifying a specific library to use
			if (!$library = $this->Library->Get($libraryid))
				$this->site->Error('Invalid library');
			if (!$this->Library->CanEdit($library))
				$this->site->Error('You do not have access to this library');
		}

		if ($method) { // We are actually screening
			$this->config->load('pagination', TRUE);
			$total = $this->Reference->Count(array('libraryid' => $library['libraryid'], 'status !=' => 'deleted'));
			$this->load->library('pagination', array_merge($this->config->item('pagination'), array(
				'base_url' => "/libraries/screen/{$library['libraryid']}/$method",
				'total_rows' => $total,
				'per_page' => SCREEN_LIMIT,
				'uri_segment' => 5,
			)));
			$this->site->header("Screening", array(
				'breadcrumbs' => array(
					'/libraries' => 'Libraries',
					"/libraries/view/{$library['libraryid']}" => $library['title'],
				),
			));
			$this->load->view('libraries/screen/screen', array(
				'library' => $library,
				'total' => $total,
				'references' => $this->Reference->GetAll(array('libraryid' => $library['libraryid'], 'status !=' => 'deleted'), 'referenceid', SCREEN_LIMIT, SCREEN_LIMIT * $page),
				'tags' => $this->Library->GetAllTags($library['libraryid']),
			));
			$this->site->footer();
			return;
		}
		// If we fell though to here we dont have enough information to screen

		// Waveform config {{{
		$this->Waveform = new Waveform();
		$this->Waveform->Style('bootstrap');
		
		$this->Waveform->Define('libraryid')
			->Title('Reference library')
			->Choice($this->Library->GetAll(array('userid' => $this->User->GetActive('userid'), 'status !=' => 'deleted')), 'libraryid', 'title')
			->Default($library ? $library : null)
			->Style('data-help-block', "or <a href='/libraries/import'>import a new library file</a>");

		$this->Waveform->Define('method')
			->Title('Screening method')
			->Choice(array(
				'title' => 'Title only',
				'title+authors' => 'Title + authors',
				'title+authors+abstract' => 'Title, authors + abstract',
			))
			->Default('title+authors');

		$this->Waveform->Define('tags')
			->Title('Tags to provide')
			->Text()
			->Style('data-tip', 'Seperate tags with commas')
			->Style('data-tip-placement', 'right')
			->Default('Full text, Background, Exclude');
		// }}}

		if ($this->Waveform->OK()) {
			if (!$library = $this->Library->Get($this->Waveform->Fields['libraryid']))
				$this->site->Error('Invalid library');
			if (!$this->Library->CanEdit($library))
				$this->site->Error('You do not have access to this library');
			foreach (preg_split('/\s*,\s*/', $this->Waveform->Fields['tags']) as $tag)
				$this->Library->CreateTag($library['libraryid'], array('title' => $tag));

			$this->site->Redirect("/libraries/screen/{$library['libraryid']}/{$this->Waveform->Fields['method']}");
		} else { 
			$this->site->header("Screen {$library['title']}", array(
				'breadcrumbs' => array(
					'/libraries' => 'Libraries'
				),
			));
			$this->load->view('libraries/screen/index', array(
				'library' => $library,
			));
			$this->site->footer();
		}
	}

	/**
	* Import a reference library file
	* @param bool $_REQUEST['debug'] If set the libraries.debug flag is set and all imported references have their .caption property set to the record number
	*/
	function Import($libraryid = null) {
		$this->load->model('Reference');

		// Waveform config {{{
		$this->Waveform = new Waveform();
		$this->Waveform->Style('bootstrap');
		
		$this->Waveform->Group('Import a reference library file');
		$this->Waveform->Define('where')
			->Choice(array(
				'new' => 'New library',
				'existing' => 'Existing library',
			))
			->Style('data-help-block', "<a href='/help/supported-formats' target='_blank'>See list of files that can be imported</a>");

		$this->Waveform->Define('new_name')
			->Title('Name of new library')
			->Default('Imported library ' . date('D M jS g:i a'))
			->NotRequired();

		$this->Waveform->Define('existing_id')
			->Choice($this->Library->GetAll(array('userid' => $this->User->GetActive('userid'), 'status !=' => 'deleted')), 'libraryid', 'title')
			->NotRequired();

		$this->Waveform->Define('advanced')
			->Title('Advanced options')
			->Checkbox();

		$this->Waveform->Define('auto_dedupe')
			->Checkbox();

		$this->Waveform->Define('debug')
			->Checkbox();
				
		$this->Waveform->Define('file')
			->File();
		// }}}

		if ($fields = $this->Waveform->ok()) {
			if (!$_FILES)
				$this->site->Error('No files uploaded');

			if ($this->Waveform->Fields['where'] == 'existing') {
				if (!$library = $this->Library->Get($this->Waveform->Fields['existing_id']))
					$this->site->Error("Invalid library to import into");
				if (!$this->Library->CanEdit($library))
					$this->site->Error("This library cannot be edited, it may have been deleted or you may not have access to it");
				$libraryid = $library['libraryid'];
			} else { // Create new library and import into that
				$libraryid = $this->Library->Create(array(
					'title' => $this->Waveform->Fields['new_name'],
					'debug' => $fields['debug'] ? 'active' : 'inactive',
				));
			}

			$this->_Importer($libraryid, (bool) $fields['debug']);

			if ($fields['auto_dedupe']) {
				$this->site->Redirect("/libraries/dedupe/$libraryid");
			} else
				$this->site->Redirect("/libraries/view/$libraryid");
		} else { 
			$this->site->Header('Import References', array(
				'breadcrumbs' => array(
					'/libraries' => 'Libraries'
				),
			));
			$this->site->view('libraries/import', array(
				'newName' => 'Imported Library',
			));
			$this->site->Footer();
		}
	}

	/**
	* Actual worker function to import incomming files
	* @param int $libraryid The library ID to import into, if none is specified one will be created
	* @param bool $debug Enable debug mode on the given library
	* @param array $_FILES The incomming file batch to import
	* @return int The library id created or given as $libraryid
	*/
	function _Importer($libraryid = null, $debug = FALSE) {
		$this->RefLib = new RefLib();
		
		if (!$_FILES) // No files to import
			return;
		if ( ($first = current($_FILES)) && !$first['size']) // File uploaded but its blank
			return;

		if (!$libraryid)
			$libraryid = $this->Library->Create(array(
				'title' => 'Imported library ' . date('D M jS g:i a'),
			));

		foreach ($_FILES as $file) {
			if (!$file['tmp_name'] || !file_exists($file['tmp_name']))
				continue;
			if ($debug) {
				$this->RefLib->fixesBackup = true;
				$this->RefLib->refId = 'rec-number';
			}
			$this->RefLib->SetContentsFile($file['tmp_name'], $file['type']);

			foreach ($this->RefLib->refs as $refno => $ref) {
				$data = $ref;
				foreach(array('authors', 'title', 'label') as $k) // Scrap fields are are storing elsewhere anyway
					if (isset($data[$k]))
						unset($data[$k]);

				$this->Reference->Create(array(
					'libraryid' => $libraryid,
					'title' => $ref['title'],
					'authors' => isset($ref['authors']) ? $ref['authors'] : '',
					'label' => isset($ref['label']) ? $ref['label'] : null,
					'data' => $data,
				));
			}
		}
		return $libraryid;
	}

	/**
	* Export a library in the format specified by $format
	* @param int $libraryid The ID of the library to export
	* @param string $format The RefLib driver to use to export the file
	* @return blob The downloadable library file
	*/
	function Export($libraryid = null, $format = null) {

		if (isset($_REQUEST['format']))
			$format = $_REQUEST['format'];

		if (!$libraryid)
			$this->site->Redirect('/libraries/select/export');
		if (!$library = $this->Library->Get($libraryid))
			$this->site->Error('Invalid library');
		if (!$this->Library->CanEdit($library))
			$this->site->Error('You do not have access to this library');

		if (!$format) {
			$this->RefLib = new RefLib();
			// Waveform config {{{
			$this->Waveform = new Waveform();
			$this->Waveform->Style('bootstrap');
			
			$this->Waveform->Define('libraryid')
				->Title('Library to use')
				->Choice($this->Library->GetAll(array('userid' => $this->User->GetActive('userid'), 'status !=' => 'deleted')), 'libraryid', 'title')
				->NotRequired()
				->Style('data-help-block', "Or <a href='/libraries/import'>import a library</a>");

			$this->Waveform->Define('format')
				->Choice($this->RefLib->GetDrivers());
			// }}}
			$this->site->Header('Export library');
			$this->load->view('libraries/export');
			$this->site->Footer();
			return;
		}


		$where = array(
			'libraryid' => $libraryid,
			'status' => ($library['debug'] == 'active') ? '*' : 'active',
		);

		$this->RefLib = new RefLib();
		if (!$this->RefLib->LoadDriver($format))
			$this->site->Error("Invalid output format: $format");
		foreach ($this->Reference->GetAll($where) as $ref) {
			$ref['authors'] = explode(' AND ', $ref['authors']);

			if ($library['debug'] == 'active') {
				switch ($ref['status']) {
					case 'active':
						$ref['language'] = 'OK';
						break;
					case 'dupe':
						$ref['language'] = 'DUPE';
						break;
					case 'deleted':
						$ref['language'] = 'DELETED';
						break;
				}
			}
			$this->RefLib->Add($ref);
		}

		$this->RefLib->DownloadContents($this->RefLib->GetFilename($library['title']), $format);
	}


	function Tags($libraryid = null) {
		$this->load->model('Reference');

		if (!$libraryid)
			$this->site->Redirect('/libraries/select/tags');
		if (!$library = $this->Library->Get($libraryid))
			$this->site->Error('Invalid library');
		if (!$this->Library->CanEdit($library))
			$this->site->Error('You do not have access to this library');

		$this->site->header('Manage Tags', array(
			'breadcrumbs' => array(
				'/libraries' => 'Libraries',
				"/libraries/view/{$library['libraryid']}" => $library['title'],
			),
		));
		$this->load->view('libraries/tags', array(
			'library' => $library,
			'tags' => $this->Library->GetAllTags($library['libraryid']),
		));
		$this->site->footer();
	}

	function Delete($libraryid = null) {
		if (!$libraryid)
			$this->site->redirect('/');
		if (!$library = $this->Library->Get($libraryid))
			$this->site->Error('Invalid library');
		if (!$this->Library->CanEdit($library))
			$this->site->Error('You do not have access to this library');
		$this->Library->SetStatus($libraryid, 'deleted');
		$this->site->Redirect("/libraries");
	}

	/**
	* Start or continue the de-duplication process
	* @param int $libraryid The library to apply the process to
	* @param string $force If the value is 'force' and the library.status='deduped' the process will be force-restarted again
	*/
	function Dedupe($libraryid = null, $force = null) {
		$this->load->model('Reference');

		if (!$libraryid)
			$this->site->Redirect('/libraries/select/dedupe');
		if (!$library = $this->Library->Get($libraryid))
			$this->site->Error('Invalid library');
		if (!$this->Library->CanEdit($library))
			$this->site->Error('You do not have access to this library');

		$this->site->header("De-duplicate", array(
			'breadcrumbs' => array(
				'/libraries' => 'Libraries',
				"/libraries/view/$libraryid" => $library['title'],
			),
		));

		switch ($force=='force' ? 'active' : $library['status']) {
			case 'active': // Start the dedupe
				$this->Library->ResetDupeStatus($library['libraryid']);
				$this->load->view('libraries/dedupe/processing', array(
					'library' => $library,
				));
				break;
			case 'dedupe': // During / continuing a dedupe
				$this->load->view('libraries/dedupe/processing', array(
					'library' => $library,
				));
				break;
			case 'deduped': // Post dedupe - review
				$this->load->view('libraries/dedupe/review', array(
					'library' => $library,
					'dupes' => $this->Reference->GetAll(array('libraryid' => $library['libraryid'], 'altdata !=' => '')),
				));
				break;
			default:
				$this->site->Error("Unable to process duplications when library is in the state '{$library['state']}'");
		}
		
		$this->site->footer();
	}

	/**
	* Called to finish the deupe process and reset the status of the library
	*/
	function Finish($libraryid = null) {
		if (!$libraryid)
			$this->site->redirect('/');
		if (!$library = $this->Library->Get($libraryid))
			$this->site->Error('Invalid library');
		if (!$this->Library->CanEdit($library))
			$this->site->Error('You do not have access to this library');

		$this->Library->SetStatus($libraryid, 'active');
		$this->site->Redirect("/libraries/view/$libraryid");
	}

	function Clear($libraryid = null) {
		if (!$libraryid)
			$this->site->redirect('/');
		if (!$library = $this->Library->Get($libraryid))
			$this->site->Error('Invalid library');
		if (!$this->Library->CanEdit($library))
			$this->site->Error('You do not have access to this library');
		$this->Library->Clear($libraryid);
		$this->site->Redirect("/libraries/view/$libraryid");
	}

	/**
	* Prompt for a library (or an upload) then redirect to the given URL
	* @param string $tool Predefined tool profile to use
	*/
	function Select($tool = 'list') {
		// Waveform config {{{
		$this->Waveform = new Waveform();
		$this->Waveform->Style('bootstrap');
		
		$libraries = array('new' => 'Upload new library');
		foreach ($this->Library->GetAll(array('userid' => $this->User->GetActive('userid'), 'status !=' => 'deleted')) as $lib)
			$libraries[$lib['libraryid']] = $lib['title'];

		$this->Waveform->Define('tool')
			->Title('Tool to use')
			->Choice(array(
				'list' => 'View references',
				'dedupe' => 'Deduplicator',
				'tags' => 'Manage library tags',
				'export' => 'Export the library file',
			))
			->Default($tool);

		$this->Waveform->Define('libraryid')
			->Title('Library to use')
			->Choice($libraries)
			->NotRequired();

		$this->Waveform->Define('file')
			->File()
			->NotRequired()
			->Style('data-help-block', "<a href='/help/supported-formats' target='_blank'>See list of files that can be imported</a>");
		// }}}

		if ($fields = $this->Waveform->OK()) {
			if ($fields['libraryid'] != 'new') { // Use existing library
				$libraryid = $fields['libraryid'];
			} elseif (! $libraryid = $this->_Importer()) { // Upload new library and use that
				$this->Waveform->Fail('file', 'Something went wrong while uploading your reference library');
			} else {
				$this->site->Redirect("/libraries/{$fields['tool']}/$libraryid");
			}
		}

		$this->site->Header('Select library');
		$this->load->view('libraries/select');
		$this->site->Footer();
	}

	/**
	* Output a collaboration matrix
	* @param int $libraryid The library ID to prepare the matrix for
	* @param int $_REQUEST['output'] The output format, see the function for available options
	* @param int $_REQUEST['threshold'] All colaborations under this number will be ignored
	*/
	function CollabMatrix($libraryid = null, $output = null) {
		$this->load->model('Reference');

		if (isset($_REQUEST['libraryid']))
			$libraryid = $_REQUEST['libraryid'];
		if (isset($_REQUEST['output']))
			$output = $_REQUEST['output'];

		if ($libraryid) {
			if (!$library = $this->Library->Get($libraryid))
				$this->site->Error('Invalid library');
			if (!$this->Library->CanEdit($library))
				$this->site->Error('You do not have access to this library');
		}

		if (!$libraryid || !$output) { // No library of output selected - display options screen
			// Waveform config {{{
			$this->Waveform = new Waveform();
			$this->Waveform->Style('bootstrap');

			$this->Waveform->Define('libraryid')
				->Title('Library')
				->Choice($this->Library->GetAll(array('status !=' => 'deleted', 'userid' => $this->User->GetActive('userid'))), 'libraryid', 'title')
				->Default($libraryid)
				->Style('data-help-block', "or <a href='/libraries/import'>import a new library file</a>");

			$this->Waveform->Define('threshold')
				->Int()
				->Style('data-help-block', 'The paper threshold to use. Leave blank to use the average number of collaborations');

			$this->Waveform->Define('output')
				->Title('Style')
				->Choice(array(
					'table' => 'Table',
					'table-raw' => 'Table (no styling)',
					'list-authors' => 'list (author a -> author b)',
					'list-count' => 'list (collaboration count)',
					'chord' => 'Chord diagram',
					'csv' => 'Downloadble CSV file',
					'raw' => 'Raw data',
				))
				->Default('chord');
			// }}}
			$this->site->Header('Collaboration Matrix', array(
				'breadcrumbs' => array_merge(array(
					'/libraries' => 'Libraries',
				), $libraryid ? array(
					"/libraries/view/{$library['libraryid']}" => $library['title'],
				) : array()),
			));
			$this->site->view('libraries/collabmatrix/options');
			$this->site->Footer();
			return;
		}


		$sep = '|||';
		$authors = array();
		$matrix = array(); // Key = $author1$sep$author2

		foreach ($this->Reference->GetAll(array('libraryid' => $library['libraryid'])) as $ref) {
			$refauthors = preg_split('/\s+AND\s+/', $ref['authors']);
			if (count($refauthors) == 1 && !$refauthors[0]) // Skip papers with no authors
				continue;
			for ($aoffset = 0; $aoffset < count($refauthors)-1; $aoffset++) {
				for ($boffset = $aoffset+1; $boffset < count($refauthors)-1; $boffset++) {
					$a = $refauthors[$aoffset];
					$b = $refauthors[$boffset];

					if (!isset($authors[$a]))
						$authors[$a] = 1;

					if (!isset($authors[$b]))
						$authors[$b] = 1;

					if (!isset($matrix["$a$sep$b"])) {
						$matrix["$a$sep$b"] = 1;
					} else {
						$matrix["$a$sep$b"]++;
					}

					if (!isset($matrix["$b$sep$a"])) {
						$matrix["$b$sep$a"] = 1;
					} else {
						$matrix["$b$sep$a"]++;
					}
				}
			}
		}

		if (!$matrix)
			$this->site->Error('No collaborations to display');

		if (!isset($_REQUEST['threshold']) || !$_REQUEST['threshold'] || $_REQUEST['threshold'] == 'auto') {
			$scores = array_unique(array_values($matrix));
			$_REQUEST['threshold'] = floor(array_sum($scores) / count($scores));
		}

		if (isset($_REQUEST['threshold']) && $_REQUEST['threshold'] > 1) {
			$new = array();
			$authors = array();
			foreach ($matrix as $key => $val)
				if ($val >= $_REQUEST['threshold']) {
					$new[$key] = $val;
					list($a, $b) = explode($sep, $key);
					$authors[$a] = 1;
				}
			$matrix = $new;
		}

		switch ($output) {
			case 'table':
				$this->site->Header('Tabular layout', array(
					'breadcrumbs' => array(
						'/libraries' => 'Libraries',
						"/libraries/view/{$library['libraryid']}" => $library['title'],
						"/libraries/collabmatrix/{$library['libraryid']}" => 'Collaboration Matrix',
					),
				));
				$this->site->view('libraries/collabmatrix/table', array(
					'authors' => $authors,
					'matrix' => $matrix,
					'sep' => $sep,
				));
				$this->site->Footer();
				break;
			case 'table-raw':
				$this->site->SetTheme('minimal');
				$this->site->Header('Tabular layout', array(
					'breadcrumbs' => array(
						'/libraries' => 'Libraries',
						"/libraries/view/{$library['libraryid']}" => $library['title'],
						"/libraries/collabmatrix/{$library['libraryid']}" => 'Collaboration Matrix',
					),
				));
				$this->site->view('libraries/collabmatrix/table', array(
					'authors' => $authors,
					'matrix' => $matrix,
					'sep' => $sep,
				));
				$this->site->Footer();
				break;
			case 'list-authors':
				$this->site->Header('List layout', array(
					'breadcrumbs' => array(
						'/libraries' => 'Libraries',
						"/libraries/view/{$library['libraryid']}" => $library['title'],
						"/libraries/collabmatrix/{$library['libraryid']}" => 'Collaboration Matrix',
					),
				));
				$this->site->view('libraries/collabmatrix/list-authors', array(
					'authors' => $authors,
					'matrix' => $matrix,
					'sep' => $sep,
				));
				$this->site->Footer();
				break;
			case 'list-count':
				$this->site->Header('List layout', array(
					'breadcrumbs' => array(
						'/libraries' => 'Libraries',
						"/libraries/view/{$library['libraryid']}" => $library['title'],
						"/libraries/collabmatrix/{$library['libraryid']}" => 'Collaboration Matrix',
					),
				));
				$this->site->view('libraries/collabmatrix/list-count', array(
					'authors' => $authors,
					'matrix' => $matrix,
					'sep' => $sep,
				));
				$this->site->Footer();
				break;
			case 'chord':
				$this->site->Header('Chord Diagram', array(
					'breadcrumbs' => array(
						'/libraries' => 'Libraries',
						"/libraries/view/{$library['libraryid']}" => $library['title'],
						"/libraries/collabmatrix/{$library['libraryid']}" => 'Collaboration Matrix',
					),
				));
				$this->site->view('libraries/collabmatrix/chord', array(
					'library' => $library,
				));
				$this->site->Footer();
				break;
			case 'csv-chord':
				//header('Content-Encoding: UTF-8');
				//header('Content-type: text/csv; charset=UTF-8');
				echo "has,prefers,count\n";
				foreach ($authors as $a => $junk) {
					foreach ($authors as $b => $junk) {
						if ($a == $b)
							continue;
						$key = ($a < $b) ? "$a$sep$b" : "$b$sep$a";
						if (!isset($matrix[$key]))
							continue;
						echo "\"$a\",\"$b\"," .
							(isset($matrix[$key]) && $matrix[$key] ? $matrix[$key] : 0) . 
							"\n";
					}
				}
				break;
			case 'csv':
				header('Content-Encoding: UTF-8');
				header('Content-type: text/csv; charset=UTF-8');
				header('Content-Disposition: attachment; filename="Author Collaboration Matrix.csv"');
				// Header row {{{
				$line = '"",';
				foreach ($authors as $a => $junk)
					$line .= '"' . $a . '",';
				echo substr($line, 0, -1) . "\n";
				// }}}
				foreach ($authors as $a => $junk) {
					$line = '"' . $a . '",';
					foreach ($authors as $b => $junk) {
						$key = ($a < $b) ? "$a$sep$b" : "$b$sep$a";
						$line .= (isset($matrix[$key]) ? $matrix[$key] : '') . ',';
					}
					echo substr($line, 0, -1) . "\n";
				}
				break;
			case 'raw':
				header('Content-type: text/plain');
				ksort($matrix);
				print_r($matrix);
				break;
			default:
				$this->site->Error('Unknown collaboration matrix output format');
		}
	}

	function TagDelete($libraryid = null, $tagid = null) {
		if (!$libraryid)
			$this->site->Redirect('/libraries/select/tags');
		if (!$library = $this->Library->Get($libraryid))
			$this->site->Error('Invalid library');
		if (!$this->Library->CanEdit($library))
			$this->site->Error('You do not have access to this library');

		$this->Library->DeleteTag($libraryid, $tagid);
		$this->site->Redirect("/libraries/tags/$libraryid");
	}

	function TagAdd($libraryid = null) {
		if (!$libraryid)
			$this->site->Redirect('/libraries/select/tags');
		if (!$library = $this->Library->Get($libraryid))
			$this->site->Error('Invalid library');
		if (!$this->Library->CanEdit($library))
			$this->site->Error('You do not have access to this library');
		if (!isset($_REQUEST['name']) || !$_REQUEST['name'])
			$this->site->Error('No name specified');

		$this->Library->AddTag($libraryid, $_REQUEST['name']);
		$this->site->Redirect("/libraries/tags/$libraryid");
	}

	/**
	* Perform an action on the left/right side duplication
	* @param string $_REQUEST['action'] The action to perform
	* @param string $_REQUEST['left'] The left side reference ID to operate on
	*/
	function JSONDupeAction() {
		$this->load->model('Reference');

		foreach (qw('action left') as $key)
			if (!isset($_REQUEST[$key]))
				die($this->site->JSONError("Missing parameter: $key"));

		switch ($_REQUEST['action']) {
			case 'save': // Accept left, delete right, merge
				// Temporarily removed so it shuts up about us not yet supporting this - MC 2014-09-18 (before Hyrobad conference)
				// die($this->site->JSONError("Not yet supported"));
				break;
			case 'delete': // Delete both left/right sides
				if (!isset($_REQUEST['right']))
					die($this->site->JSONError("Missing parameter: right"));
				if (!$left = $this->Reference->Get($_REQUEST['left']))
					die($this->site->JSONError("Invalid left reference"));
				if (!$right = $this->Reference->Get($_REQUEST['right']))
					die($this->site->JSONError("Invalid right reference"));

				// Set both as active
				$this->Reference->SetStatus($left['referenceid'], 'deleted');
				$this->Reference->SetStatus($right['referenceid'], 'deleted');
				break;
			case 'break': // left/right is not a dupe
				if (!isset($_REQUEST['right']))
					die($this->site->JSONError("Missing parameter: right"));
				if (!$left = $this->Reference->Get($_REQUEST['left']))
					die($this->site->JSONError("Invalid left reference"));
				if (!$right = $this->Reference->Get($_REQUEST['right']))
					die($this->site->JSONError("Invalid right reference"));

				// Set both as active
				$this->Reference->SetStatus($left['referenceid'], 'active');
				$this->Reference->SetStatus($right['referenceid'], 'active');

				// Remove alternative data
				$left['altdata'] = '';
				$this->Reference->Save($left['referenceid'], $left);

				break;
			default:
				die($this->site->JSONError("Invalid action: {$_REQUEST['action']}"));
		}

		$this->site->JSON(array(
			'header' => array(
				'status' => 'ok',
			),
		));
	}

	/**
	* API worker for Dupes()
	* @param int $_REQUEST['libraryid'] The library ID to work on
	* @see Dupes()
	*/
	function JSONDupes() {
		$this->load->model('Reference');

		foreach (qw('libraryid') as $key)
			if (!isset($_REQUEST[$key]))
				die($this->site->JSONError("Missing parameter: $key"));

		if (!$library = $this->Library->Get($_REQUEST['libraryid']))
			die($this->site->JSONError('Invalid library'));
		if ($library['status'] != 'dedupe')
			die($this->site->JSONError('Not in De-dupe mode'));

		$end = time() + DEDUPE_MAX_TIME;
		set_time_limit(DEDUPE_MAX_TIME*2); // Bias PHPs own time limit by a good margin (time to respond with the JSON)

		$refoffset = $refoffset2 = 0;
		while ($refs = $this->Reference->GetAll(array('libraryid' => $library['libraryid'], 'referenceid >' => max(0, $library['dedupe_refid']), 'status' => 'active'), DEDUPE_ORDERBY, DEDUPE_SCOOP_REFERENCES)) {
			foreach ($refs as $ref) {
				while ($refs2 = $this->Reference->GetAll(array('libraryid' => $library['libraryid'], 'referenceid >' => max(0, $ref['referenceid'], $library['dedupe_refid2']), 'status' => 'active'), DEDUPE_ORDERBY, DEDUPE_SCOOP_REFERENCES2)) {
					foreach ($refs2 as $ref2) {
						// echo "SCAN {$ref['referenceid']} == {$ref2['referenceid']}<br/>";
						$this->Reference->Compare($ref, $ref2);
					}
					$library['dedupe_refid2'] = $ref2['referenceid'];
					$this->Library->SaveDupeStatus($library['libraryid'], $library['dedupe_refid'], $library['dedupe_refid2']);
					if (time() >= $end)
						break 2;
				}
				$library['dedupe_refid'] = $ref['referenceid'];
				$library['dedupe_refid2'] = 0;
			}
			$this->Library->SaveDupeStatus($library['libraryid'], $library['dedupe_refid'], $library['dedupe_refid2']);
			if (time() >= $end)
				break;
		}

		$total = $this->Reference->Count(array('libraryid' => $library['libraryid']));
		$done = $library['dedupe_refid'] ? $this->Reference->Count(array('libraryid' => $library['libraryid'], 'referenceid <=' => $library['dedupe_refid'])) + 1 : 0;
		if ($done >= $total)
			$this->Library->SetStatus($library['libraryid'], 'deduped');

		$this->site->JSON(array(
			'header' => array(
				'status' => 'ok',
			),
			'payload' => array(
				'done' => $done,
				'total' => $total,
				'dupes' => $this->Reference->Count(array('libraryid' => $library['libraryid'], 'status' => 'dupe')),
			),
		));
	}

	/**
	* API for setting the reference tag of an item
	* @param int $_REQUEST['referenceid'] The reference ID to work on
	* @param int $_REQUEST['tagid'] The ID of the tag to set
	*/
	function JSONSetTag() {
		$this->load->model('Reference');

		foreach (qw('referenceid tagid') as $key)
			if (!isset($_REQUEST[$key]))
				die($this->site->JSONError("Missing parameter: $key"));

		if (!$reference = $this->Reference->Get($_REQUEST['referenceid']))
			$this->site->JSONError('Invalid reference');
		if (!$library = $this->Library->Get($reference['libraryid']))
			$this->site->JSONError('Invalid library');
		if (!$this->Library->CanEdit($library))
			$this->site->JSONError('You do not have access to this library');
		$reference['referencetagid'] = $_REQUEST['tagid'];
		$this->Reference->Save($reference['referenceid'], $reference);

		$tags = array(
			0 => $this->Reference->Count(array('libraryid' => $library['libraryid'], 'status !=' => 'deleted')),
		);

		foreach ($this->Library->GetAllTags($library['libraryid']) as $tag)
			$tags[$tag['referencetagid']] = $this->Reference->Count(array('libraryid' => $library['libraryid'], 'status !=' => 'deleted', 'referencetagid' => $tag['referencetagid']));

		$this->site->JSON(array(
			'header' => array(
				'status' => 'ok',
			),
			'tags' => $tags,
		));
	}
}

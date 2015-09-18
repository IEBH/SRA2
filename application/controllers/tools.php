<?
class Tools extends CI_Controller {
	function __construct() {
		parent::__construct();
	}

	function CollabMatrix() {
		// Waveform config {{{
		$this->Waveform = new Waveform();
		$this->Waveform->Style('bootstrap');
		
		$this->Waveform->Define('file')
			->File();

		$this->Waveform->Define('col')
			->Title('Author Column')
			->Default(2)
			->int();

		$this->Waveform->Define('threshold')
			->Title('Threshold')
			->Default(1)
			->int();

		$this->Waveform->Define('output')
			->Title('Output format')
			->Choice(array(
				'html' => 'HTML table',
				'html-raw' => 'HTML table (no styling)',
				'list-authors' => 'list (author a -> author b)',
				'list-count' => 'list (collaboration count)',
				'csv' => 'CSV output',
				'raw' => 'Raw output',
			));
		// }}}

		if ($fields = $this->Waveform->ok()) {
			if (!$_FILES)
				$this->site->Error('No files uploaded');

			$sep = '|||';
			$authors = array();
			$matrix = array(); // Key = $author1$sep$author2

			foreach ($_FILES as $file) {
				if (!$file['tmp_name'] || !file_exists($file['tmp_name']))
					continue;
				$fh = fopen($file['tmp_name'], 'r');
				$line = 0;
				$col = $fields['col']-1;
				while ($bits = fgetcsv($fh)) {
					$line++;
					if (!isset($bits[$col]))
						$this->site->Error("Column {$fields['col']}, does not exist on line $line");
					$csvauthors = preg_split('/\s*,\s*/', $bits[$col]);
					foreach ($csvauthors as $aoffset => $a) {
						for ($boffset = $aoffset+1; $boffset < count($csvauthors); $boffset++) {
							$b = $csvauthors[$boffset];
							if ($a == $b) // Skip if same person
								continue;

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
				fclose($fh);
				ksort($authors);
			}

			if ($fields['threshold'] > 1) {
				$new = array();
				$authors = array();
				foreach ($matrix as $key => $val)
					if ($val >= $fields['threshold']) {
						$new[$key] = $val;
						list($a, $b) = explode($sep, $key);
						$authors[$a] = 1;
					}
				$matrix = $new;
			}

			switch ($fields['output']) {
				case 'html':
					$this->site->Header('Results', array(
						'breadcrumbs' => array(
							'/tools' => 'Tools',
							'/tools/collabmatrix' => 'Collaboration Matrix',
						),
					));
					$this->site->view('tools/collabmatrix-table', array(
						'authors' => $authors,
						'matrix' => $matrix,
						'sep' => $sep,
					));
					$this->site->Footer();
					break;
				case 'html-raw':
					$this->site->SetTheme('minimal');
					$this->site->Header('Results', array(
						'breadcrumbs' => array(
							'/tools' => 'Tools',
							'/tools/collabmatrix' => 'Collaboration Matrix',
						),
					));
					$this->site->view('tools/collabmatrix-table', array(
						'authors' => $authors,
						'matrix' => $matrix,
						'sep' => $sep,
					));
					$this->site->Footer();
					break;
				case 'list-authors':
					$this->site->Header('Results', array(
						'breadcrumbs' => array(
							'/tools' => 'Tools',
							'/tools/collabmatrix' => 'Collaboration Matrix',
						),
					));
					$this->site->view('tools/collabmatrix-list-authors', array(
						'authors' => $authors,
						'matrix' => $matrix,
						'sep' => $sep,
					));
					$this->site->Footer();
					break;
				case 'list-count':
					$this->site->Header('Results', array(
						'breadcrumbs' => array(
							'/tools' => 'Tools',
							'/tools/collabmatrix' => 'Collaboration Matrix',
						),
					));
					$this->site->view('tools/collabmatrix-list-count', array(
						'authors' => $authors,
						'matrix' => $matrix,
						'sep' => $sep,
					));
					$this->site->Footer();
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
			}
		} else {
			$this->site->Header('Collaboration Matrix', array(
				'breadcrumbs' => array(
					'/tools' => 'Tools'
				),
			));
			$this->site->view('tools/collabmatrix');
			$this->site->Footer();
		}
	}
}

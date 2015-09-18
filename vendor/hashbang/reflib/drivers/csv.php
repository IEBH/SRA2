<?php
/**
* CSV driver for RefLib
*/
class RefLib_csv {
	var $driverName = 'CSV';

	/**
	* The parent instance of the RefLib class
	* @var class
	*/
	var $parent;

	/**
	* Map of parent columns to CSV fields
	* Key is the CSV offset number, value is the field to export
	* @var array
	*/
	var $columns;

	/**
	* Attempt to match parent columns via these regexp arrays
	* All regexps are run with the /i flag for case-insensitive
	* @var array
	*/
	var $columnDefs = array(
		'authors' => array('^authors?$', '^writers?$', '^names?$', 'byline$'),
		'address' => array('^address$'),
		'contact-name' => array('^contact.name$'),
		'contact-email' => array('^contact.email$', '^emails?$'),
		'title' => array('^title$'),
		'title-secondary' => array('^title.secondary$', '^secondary.title$', '^other.title$'),
		'title-short' => array('^title.short$', '^short.title$'),
		'periodical-title' => array('^periodical.titles?', '^periodicals?$'),
		'pages' => array('^pages?$'),
		'volume' => array('^volumes?'),
		'number' => array('^numbers?'),
		'section' => array('^sections?'),
		'year' => array('^years?$'),
		'date' => array('^dates?$'),
		'abstract' => array('^abstract$'),
		'urls' => array('^urls?$'),
		'notes' => array('^notes?$'),
		'research-notes' => array('^research.notes$'),
		'isbn' => array('^isbns?$'),
		'label' => array('^label$'),
		'caption' => array('^caption$'),
		'language' => array('^language$'),
		'custom1' => array('^custom$', 'custom1'),
		'custom2' => array('custom2'),
		'custom3' => array('custom3'),
		'custom4' => array('custom4'),
		'custom5' => array('custom5'),
		'custom6' => array('custom6'),
		'custom7' => array('custom7'),
	);

	/**
	* Escpe a string in an EndNote compatible way
	* @param string $string The string to be escaped
	* @return string The escaped string
	*/
	function Escape($string) {
		return strtr($string, array(
			'"' => '\"',
		));
	}

	/**
	* Computes the default filename if given a $salt
	* @param string $salt The basic part of the filename to use
	* @return string The filename including extension to use as default
	*/
	function GetFilename($salt = 'CSV') {
		return "$salt.csv";
	}

	function GetContents() {
	}

	function SetContents($blob) {
		$recno = 0;

		foreach (explode("\n", $blob) as $line) {
			if (!$line)
				continue;
			$csv = str_getcsv($line);
			$recno++;

			if (!$this->columns) { // Not seen any column information yet
				foreach ($csv as $bit) {
					foreach ($this->columnDefs as $field => $possibles)
						foreach ($possibles as $possible)
							if (preg_match("/$possible/i", $bit)) {
								$found = $field;
								$this->columns[] = $field;
								continue 3;
							}
						$this->columns[] = null;
				}
			} else { // Have got column setup - process data line
				$ref = array();
				foreach ($this->columns as $offset => $field)
					if ($field)
						$ref[$field] = $csv[$offset];

				if (isset($ref['authors']))
					$ref['authors'] = $this->parent->ReJoin($ref['authors']);
				// Append to $this->parent->refs {{{
				if (!$this->parent->refId) { // Use indexed array
					$this->parent->refs[] = $ref;
				} elseif (is_string($this->parent->refId)) { // Use assoc array
					if ($this->parent->refId == 'rec-number') {
						$this->parent->$refs[$recno] = $ref;
					} elseif (!isset($ref[$this->parent->refId])) {
						trigger_error("No ID found in reference to use as key");
					} else {
						$this->parent->refs[$ref[$this->parent->refId]] = $ref;
					}
				}
				// }}}
			}
		}
	}
}

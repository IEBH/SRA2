<?
class Reference extends Joyst_Model {
	function __construct() {
		parent::__construct();
		$this->load->Model('Library');
	}

	function DefineSchema() {
		$this->On('access', function(&$row) {
			if (!$this->User->GetActive('userid'))
				return $this->Deny('You are not logged in');
		});
		$this->On('pull', function(&$where) {
			if (!isset($where['referenceid']) && !isset($where['libraryid'])) // Not requesting direct OR not asking for libraryid
				return $this->Deny('Libraryid must be specified - ' . json_encode($where));

			if (isset($where['libraryid']) && !$this->Library->CanEdit($where['libraryid']))
				return $this->Deny('You do not have permission to access that library');
		});
		$this->On('create', function(&$row) {
			$row['created'] = time();
			if (isset($row['authors']) && is_array($row['authors']))
				$row['authors'] = implode(' AND ', $row['authors']);
		});
		$this->On('save', function(&$id, &$row) {
			$row['edited'] = time();
			if (isset($row['authors']) && is_array($row['authors']))
				$row['authors'] = implode(' AND ', $row['authors']);
		});
		$this->On('getall', function(&$where) {
			if (!isset($where['status'])) { // If status not explicit - assume active
				$where['status'] = 'active';
			} elseif ($where['status'] == '*') {
				unset($where['status']);
			}
		});
		return array(
			'_model' => 'Reference',
			'_table' => 'references',
			'_id' => 'referenceid',
			'referenceid' => array(
				'type' => 'pk',
			),
			'libraryid' => array(
				'type' => 'fk',
			),
			'referencetagid' => array(
				'type' => 'fk'
			),
			'status' => array(
				'type' => 'enum',
				'options' => array(
					'active' => 'Active',
					'dupe' => 'Duplicate',
					'deleted' => 'Deleted',
				),
			),
			'title' => array(
				'type' => 'varchar',
				'length' => 100,
			),
			'authors' => array(
				'type' => 'text',
			),
			'yourref' => array(
				'type' => 'varchar',
				'length' => 200,
			),
			'label' => array(
				'type' => 'varchar',
				'length' => 100,
			),
			'data' => array(
				'type' => 'json-import',
			),
			'altdata' => array(
				'type' => 'json',
			),
			'created' => array(
				'type' => 'int',
				'readonly' => true,
			),
			'edited' => array(
				'type' => 'int',
				'readonly' => true,
			),
		);
	}

	function GetByYourRef($yourref, $libraryid = null) {
		$this->db->from('references');
		$this->db->where('yourref', $yourref);
		$this->db->where('status', 'active');
		if ($libraryid)
			$this->db->where('libraryid', $libraryid);
		$this->db->limit(1);
		return $this->db->get()->row_array();
	}

	function SetStatus($referenceid, $status) {
		$this->db->where('referenceid', $referenceid);
		$this->db->update('references', array(
			'status' => $status,
		));
	}

	/**
	* Flattens arrays or returns already flattened string values
	* @param array|string $string Possible array or string to flatten
	* @return string The delimetered array or the $string unedited
	*/
	function Flatten($string, $delimeter = ' AND ') {
		if (is_string($string) || is_int($string)) {
			return $string;
		} elseif (is_array($string)) {
			return implode($delimeter, $string);
		} else {
			trigger_error("Dont know how to flatten string: $string");
		}
	}

	/**
	* Compare two reference objects and return a boolean if they are similar
	* @param array $a The primary reference to compare
	* @param array $b The secondary (slave) reference to compare
	* @param bool $debug If true a string is returned as to why the papers are not identical instead of boolean FALSE
	* @return bool|string Boolean indicating whether the papers are similar OR if $debug==true the reason why they match or not as a string
	*/
	function Compare($a, $b, $debug = FALSE) {
		$isdupe = false;
		$alts = array(); // Alternate values we found
		$save = array(); // Data we should just save to A

		if ( // Simple field comparison - if author AND title match (or fuzzy match) then count it as an overall match
			$this->StringCompare($a['title'], $b['title']) &&
			(
				$this->StringCompare($a['authors'], $b['authors']) ||
				$this->CompareAuthors($a['authors'], $b['authors'])
			)
		) {
			foreach (array('title', 'authors') as $f) // Not an exact match - store alternate
				if ($a[$f] != $b[$f]) {
					if (!isset($alts[$f]))
						$alts[$f] = array();
					$alts[$f][$b['referenceid']] = $b[$f];
				}
			$isdupe = true;
		}
		
		// We've determined the data is a duplicate - now decide what to merge before we delete $b
		if ($isdupe) {
			// Basic sanity checks - not a match if year, page, volume, isbn or number is present BUT mismatch exactly
			if (isset($a['year'], $b['year']) && $a['year'] != $b['year'])
				return $debug ? "Year mismatch '{$a['year']}' != '{$b['year']}'" : false;
			if (isset($a['pages'], $b['pages']) && $a['pages'] != $b['pages'])
				return $debug ? "Pages mismatch '{$a['pages']}' != '{$b['pages']}'" : false;
			if (isset($a['volume'], $b['volume']) && $a['volume'] != $b['volume'])
				return $debug ? "Volume mismatch '{$a['volume']}' != '{$b['volume']}'" : false;
			if (isset($a['number'], $b['number']) && $a['number'] != $b['number'])
				return $debug ? "Number mismatch '{$a['number']}' != '{$b['number']}'" : false;
			if (isset($a['isbn'], $b['isbn']) && !$this->CompareStringMultiple($a['isbn'], $b['isbn']))
				return $debug ? "ISBN mismatch '{$a['isbn']}' != '{$b['isbn']}'" : false;

			foreach (array_merge(array_keys($a), array_keys($b)) as $key) {
				if (substr($key, 0, 1) == '_' || in_array($key, array('referenceid', 'libraryid', 'referencetagid', 'status', 'yourref', 'data', 'altdata', 'created', 'edited'))) // Ignore meta fields or certain fields we dont care about merging
					continue;
				if (isset($a[$key]) && is_array($a[$key]))
					$a[$key] = implode(' AND ', $a[$key]);
				if (isset($b[$key]) && is_array($b[$key]))
					$b[$key] = implode(' AND ', $b[$key]);

				if (!isset($a[$key])) { // B has data that A does not -- Assign to A
					$save[$key] = $b[$key];
				} elseif (!isset($b[$key])) { // A has data that B does not
					// Do nothing - we dont care about B as its going to be deleted anyway
				} elseif ($a[$key] == $b[$key]) { // Direct match A==B
					// Do nothing - we dont care about exact duplicates
				} else { // Not an exact match - store it as an alternate
					if (!isset($alts[$key])) // Alt key not set
						$alts[$key] = array();
					$alts[$key][$b['referenceid']] = $b[$key];
				}
			}

			$save['altdata'] = json_encode($alts);
			$this->Save($a['referenceid'], array_merge($a, $save));
			$this->SetStatus($b['referenceid'], 'dupe');
		}

		return $isdupe;
	}

	/**
	* Fuzzy compare for two strings
	* @param string $a The first string to compare
	* @param string $b The second string to compare
	* @return bool Whether the two strings are similar
	*/
	function StringCompare($a, $b) {
		if ($a == $b) // Direct match
			return true;

		$as = $this->StripNoise($a);
		if (strlen($as) > 255)
			$as = substr($as, 0, 255);

		$bs = $this->StripNoise($b);
		if (strlen($bs) > 255)
			$bs = substr($bs, 0, 255);

		if (levenshtein($as, $bs) < 10) {
			return true;
		}
		return false;
	}

	/**
	* Attempt to compare two strings where either $a or $b can have multiple items
	* @param string $a The A side to compare
	* @param string $b The B side to compare
	* @param string $splitOn The RegExp string to split $a and $b by before comparison
	* @return bool Whether A occurs anywhere in B (or vise-versa)
	*/
	function CompareStringMultiple($a, $b, $splitOn = '/[a-z0-9-_]+/sm') {
		$aBits = preg_split($splitOn, $a);
		$bBits = preg_split($splitOn, $b);
		return (bool) array_intersect($aBits, $bBits);
	}

	/**
	* Removes 'noise' from strings for easy comparison
	* @param string $string The incomming string
	* @return string The output string with noise removed
	*/
	function StripNoise($string) {
		$string = trim($string);
		$string = preg_replace('/[^a-z0-9]+/i', ' ', $string);
		$string = preg_replace('/ (the|a) /', ' ', $string);
		return $string;
	}

	/**
	* Mark two reference objects as duplicates
	* @param array $a The primary reference to mark as a duplicate
	* @param array $b The secondary (slave) reference to mark as a duplicate
	*/
	function MarkDupe($a, $b) {
		$this->db->insert('referencedupes', array(
			'referenceid1' => $a['referenceid'],
			'referenceid2' => $b['referenceid'],
		));
	}

	/**
	* Get a list of all duplicate records
	*/
	function GetDupes() {
		$this->db->from('referencedupes');
		$this->db->join('references AS a', 'a.referenceid = referencedupes.referenceid1');
		$this->db->join('references AS b', 'b.referenceid = referencedupes.referenceid2');
		$this->db->order_by('referencedupes.referenceid1');
		return $this->db->get()->result_array();
	}

	/**
	* Split a string of authors into an array
	* @param string $authors The raw author string to be split
	* @return array An array of author information extracted from the @authors string
	*/
	function SplitAuthors($authors) {
		return preg_split('/\s*;\s*/', $authors);
	}

	/**
	* Attempt to match two author strings using fuzzy logic
	* @param string|array $a The first set of authors - either as a string or after using SplitAuthors()
	* @param string|array $b The second set of authors - either as a string or after using SplitAuthors()
	* @see SplitAuthors()
	* @return bool Whether the author strings seem similar
	*/
	function CompareAuthors($a, $b) {
		if (is_string($a))
			$a = $this->SplitAuthors($a);
		if (is_string($b))
			$b = $this->SplitAuthors($b);

		$authorLimit = min(count($a), count($b));

		$aPos = 0;
		$bPos = 0;
		$failed = 0;
		while ($aPos < $authorLimit && $bPos < $authorLimit) {
			if ($this->IsDecendentNumeric($a[$aPos])) {
				$aPos++;
			} elseif ($this->IsDecendentNumeric($b[$bPos])) {
				$bPos++;
			} elseif ($a[$aPos] == $b[$bPos]) {
				$aPos++;
				$bPos++;
			} elseif ($this->StringCompare($a[$aPos], $b[$bPos])) {
				$aPos++;
				$bPos++;
			} else {
				$aAuth = $this->SplitAuthor($a[$aPos]);
				$bAuth = $this->SplitAuthor($b[$bPos]);
				$nameLimit = min(count($aAuth), count($bAuth));
				$nameMatches = 1;
				for ($n = 0; $n < $nameLimit; $n++) {
					if ($aAuth[$n] == $bAuth[$n]) { // Direct match
						$nameMatches++;
					} elseif (strlen($aAuth[$n]) == 1 && substr($bAuth[$n], 0, 1)) { // A is initial and B full name
						$nameMatches++;
					} elseif (strlen($bAuth[$n]) == 1 && substr($aAuth[$n], 0, 1)) { // B is initial and A full name
						$nameMatches++;
					} elseif (strlen($aAuth[$n]) > 1 && strlen($bAuth[$n]) > 1 && $this->StringCompare($aAuth[$n], $bAuth[$n])) { // Both are full names and they match a fuzzy match criteria
					} else { // Nothing matched - name comparison failure
						break;
					}
				}

				if ($nameMatches >= $nameLimit) {
					$aPos++;
					$bPos++;
				} else {
					$failed = 1;
				}
				break;
			}
			$aPos++;
		}
		return !$failed;
	}

	/**
	* Splits an author string into its component parts
	* @param string $author The author information to split
	* @param bool $firstLast Whether to allow for first-last human style names (e.g. 'John Smith'). If disabled all names are treated as if its in last-first order
	* @return array An array composed of array(lastname, inital/name...)
	*/
	function SplitAuthor($author, $firstLast = false) {
		$out = array();
		if (preg_match('/^(.*?)' . ($firstLast ? ',' : ',?') . '\s*(.*)\s*$/', $author, $matches)) { // Smith, J. Hoover / Smith, John
			if ($matches[1])
				$out[] = $matches[1];
			foreach (preg_split('/\s*(\.| )\s*/', $matches[2]) as $initial) {
				$initial = trim($initial);
				$initial = rtrim($initial, ',');
				if ($initial)
					$out[] = $initial;
			}
		} elseif ($firstLast && preg_match('/^(.*)\s+(.*)/', $author, $matches)) { // John Smith // John H. W. Smith
			$out[] = $matches[2];
			foreach (preg_split('/\s*(\.| )\s*/', $matches[1]) as $initial)
				if ($initial = trim($initial))
					$out[] = $initial;
		} else { // No idea - return whole string
			$out[] = $author;
		}
		return $out;
	}

	/**
	* Returns true if the input string looks like a decendency numeric e.g. '1st, 2nd, 3rd, 4th'
	* @param string $string The string to examine
	* @return bool True if the $string is a decendency numeric
	*/
	function IsDecendentNumeric($string) {
		return (bool) preg_match('/^[0-9]+(st|nd|rd|th)$/', $string);
	}
}

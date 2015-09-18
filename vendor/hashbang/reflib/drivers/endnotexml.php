<?php
/**
* EndNote XML driver for RefLib
*/
class RefLib_endnotexml {
	var $driverName = 'EndNoteXML';

	/**
	* The parent instance of the RefLib class
	* @var class
	*/
	var $parent;

	/**
	* Whether to apply htmlentitites() encoding during an export operation
	* @var bool
	*/
	var $escapeExport = true;

	/**
	* The internal name to call the file
	* As far as I am aware this does not actually serve a purpose but EndNote refuses to import the file unless its specified
	* @var string
	*/
	var $endNoteFile = 'EndNote.enl';

	/**
	* Reference type lookup table
	* Key is the human EndNote string, value is the EndNote int value
	* @var array
	*/
	var $refTypes = array(
		'Aggregated Database' => 55,
		'Ancient Text' => 51,
		'Artwork' => 2,
		'Audiovisual Material' => 3,
		'Bill' => 4,
		'Blog' => 56,
		'Book' => 6,
		'Book Section' => 5,
		'Case' => 7,
		'Catalog' => 8,
		'Chart or Table' => 38,
		'Classical Work' => 49,
		'Computer Program' => 9,
		'Conference Paper' => 47,
		'Conference Proceedings' => 10,
		'Dataset.' => 59,
		'Dictionary' => 52,
		'Edited Book' => 28,
		'Electronic Article' => 43,
		'Electronic Book Section' => 60,
		'Encyclopedia' => 53,
		'Equation' => 39,
		'Figure' => 37,
		'Film or Broadcast' => 21,
		'Generic' => 13,
		'Government Document' => 46,
		'Grant' => 54,
		'Hearing' => 14,
		'Journal Article' => 17,
		'Legal Rule or Regulation' => 50,
		'Magazine Article' => 19,
		'Manuscript' => 36,
		'Map' => 20,
		'Music' => 61,
		'Newspaper Article' => 23,
		'Online Database' => 45,
		'Online Multimedia' => 48,
		'Pamphlet' => 24,
		'Patent' => 25,
		'Personal Communication' => 26,
		'Report' => 27,
		'Serial' => 57,
		'Standard' => 58,
		'Statute' => 31,
		'Thesis' => 32,
		'Unpublished Work' => 34,
		'Web Page' => 12,
	);

	/**
	* Escpe a string in an EndNote compatible way
	* @param string $string The string to be escaped
	* @return string The escaped string
	*/
	function Escape($string) {
		return strtr($string, array(
			"\r" => '&#13;',
			'&' => '&amp;',
			'<' => '&lt;',
			'>' => '&gt;',
		));
	}

	/**
	* Internal function to optionally escape strings based on $escapeExport
	* @param string $string The string to return, optionally escaped
	* @return string The optionally escaped string
	* @see $escapeExport
	*/
	function _export($string) {
		return $this->escapeExport ? $this->Escape($string) : $string;
	}

	/**
	* Computes the default filename if given a $salt
	* @param string $salt The basic part of the filename to use
	* @return string The filename including extension to use as default
	*/
	function GetFilename($salt = 'EndNote') {
		return "$salt.xml";
	}

	/**
	* Return the raw XML of the $refs array
	* @see $refs
	*/
	function GetContents() {
		$out = '<' . '?xml version="1.0" encoding="UTF-8"?' . '><xml><records>';
		$number = 0;
		foreach ($this->parent->refs as $id => $ref) {
			$out .= '<record>';
			$out .= '<database name="' . $this->endNoteFile . '" path="C:\\' . $this->endNoteFile . '">' . $this->_export($this->endNoteFile) . '</database>';
			$out .= '<source-app name="EndNote" version="16.0">EndNote</source-app>';
			$out .= '<rec-number>' . $number . '</rec-number>';
			$out .= '<foreign-keys><key app="EN" db-id="s55prpsswfsepue0xz25pxai2p909xtzszzv">' . $number . '</key></foreign-keys>';
			if ($ref['type'] && isset($this->refTypes[$ref['type']]) ) {
				$out .= "<ref-type name=\"{$ref['type']}\">{$this->refTypes[$ref['type']]}</ref-type>";
			} else {
				$out .= '<ref-type name="Journal Article">17</ref-type>';
			}

			$out .= '<contributors><authors>';
				foreach ($ref['authors'] as $author)
					$out .= '<author><style face="normal" font="default" size="100%">' . $this->_export($author) . '</style></author>';
			$out .= '</authors></contributors>';

			$out .= '<titles>';
				$out .= '<title><style face="normal" font="default" size="100%">' . $this->_export($ref['title']) . '</style></title>';
				$out .= '<secondary-title><style face="normal" font="default" size="100%">' . (isset($ref['title-secondary']) && $ref['title-secondary'] ? $this->_export($ref['title-secondary']) : '') . '</style></secondary-title>';
				if (isset($ref['title-short']) && $ref['title-short'])
					$out .= '<short-title><style face="normal" font="default" size="100%">' . $this->_export($ref['title-short']) . '</style></short-title>';
				if (isset($ref['alt-journal']) && $ref['alt-journal'])
					$out .= '<alt-title><style face="normal" font="default" size="100%">' . $this->_export($ref['alt-journal']) . '</style></alt-title>';
			$out .= '</titles>';

				$out .= '<periodical><full-title><style face="normal" font="default" size="100%">' . (isset($ref['periodical-title']) && $ref['periodical-title'] ? $this->_export($ref['periodical-title']) : '') . '</style></full-title></periodical>';

			// Simple key values
			// EndNote field on left, RefLib on right
			foreach (array(
				'access-date' => 'access-date',
				'accession-num' => 'accession-num',
				'auth-address' => 'address',
				'electronic-resource-num' => 'doi',
				'pages' => 'pages',
				'volume' => 'volume',
				'number' => 'number', // issue #
				'section' => 'section',
				'abstract' => 'abstract',
				'isbn' => 'isbn',
				'label' => 'label',
				'caption' => 'caption',
				'language' => 'language',
				'notes' => 'notes',
				'research-notes' => 'research-notes',
				'remote-database-provider' => 'database-provider',
				'remote-database-name' => 'database',
				'work-type' => 'work-type',
				'custom1' => 'custom1',
				'custom2' => 'custom2',
				'custom3' => 'custom3',
				'custom4' => 'custom4',
				'custom5' => 'custom5',
				'custom6' => 'custom6',
				'custom7' => 'custom7',
			) as $enkey => $ourkey)
				if (isset($ref[$ourkey]) && $ref[$ourkey])
					$out .= "<$enkey><style face=\"normal\" font=\"default\" size=\"100%\">" . $this->_export($ref[$ourkey]) . "</style></$enkey>";

			$out .= '<dates>';
				$out .= '<year><style face="normal" font="default" size="100%">' . (isset($ref['year']) && $ref['year'] ? $this->_export($ref['year']) : '') . '</style></year>';
				$out .= '<pub-dates><date><style face="normal" font="default" size="100%">' . (isset($ref['date']) && $ref['date'] ? $this->_export($this->parent->ToDate($ref['date'])) : '') . '</style></date></pub-dates>';
			$out .= '</dates>';

			if (isset($ref['urls']) && $ref['urls']) {
				$out .= '<urls><related-urls>';
					foreach ((array) $ref['urls'] as $url)
						$out .= '<url><style face="normal" font="default" size="100%">' . $this->_export($url) . '</style></url>';
				$out .= '</related-urls></urls>';
			}

			if (isset($ref['keywords']) && $ref['keywords']) {
				$out .= '<keywords>';
					foreach ((array) $ref['keywords'] as $keyword)
						$out .= '<keyword><style face="normal" font="default" size="100%">' . $this->_export($keyword) . '</style></keyword>';
				$out .= '</keywords>';
			}

			$out .= '</record>';
			$number++;
		}
		$out .= '</records></xml>';
		return $out;
	}

	/**
	* Return the text content of a SimpleXMLElement
	* @param SimpleXMLELement $xmlnode The node to return the content of
	* @return string The content of $xmlnode
	* @access private
	*/
	function _GetText($xmlnode) {
		return (string) $xmlnode[0][0];
	}

	function SetContents($xml) {
		$dom = new SimpleXMLElement($xml);
		foreach ($dom->records->record as $record) {
			$ref = array(
				'authors' => array(),
				'urls' => array(),
				'title' => '',
			);
			foreach ($record->xpath('contributors/authors/author/style/text()') as $authors) 
				$ref['authors'][] = $this->_GetText($authors);

			foreach ($record->xpath('urls/related-urls/url/style/text()') as $url) 
				$ref['urls'][] = $this->_GetText($url);

			if ($record->xpath('keywords')) {
				$ref['keywords'] = array();
				foreach ($record->xpath('keywords/keyword/style/text()') as $keyword) 
					$ref['keywords'][] = $this->_GetText($keyword);
			}

			if ($find = $record->xpath("titles/title/style/text()"))
				$ref['title'] = $this->_GetText($find);
			if ($find = $record->xpath("titles/secondary-title/style/text()"))
				$ref['title-secondary'] = $this->_GetText($find);
			if ($find = $record->xpath("titles/short-title/style/text()"))
				$ref['title-short'] = $this->_GetText($find);
			if ($find = $record->xpath("titles/alt-title/style/text()"))
				$ref['alt-journal'] = $this->_GetText($find);
			if ($find = $record->xpath("periodical/full-title/style/text()"))
				$ref['periodical-title'] = $this->_GetText($find);
			if ($find = $record->xpath("dates/year/style/text()"))
				$ref['year'] = $this->_GetText($find);
			if ($find = $record->xpath("dates/pub-dates/date/style/text()"))
				$ref['date'] = $this->parent->ToEpoc($this->_GetText($find), $ref);
			if ($find = $record->xpath("ref-type/text()")) {
				$typesFlipped = array_flip($this->refTypes);
				if (isset($typesFlipped[$this->_GetText($find)])) {
					$ref['type'] = $typesFlipped[$this->_GetText($find)];
				} else {
					$attrs = $find[0]->attributes();
					die('Unknown reference type: [\'' .  ((string) $attrs->name) . '\' => ' . $this->_GetText($find) . "]. Please report this at https://github.com/hash-bang/RefLib/issues with a copy of your EndNote XML file if you believe this is in error");
				}
			}

			// Simple key=>vals
			// EndNote on left, RefLib on right
			foreach (array(
				'access-date' => 'access-date',
				'accession-num' => 'accession-num',
				'auth-address' => 'address',
				'electronic-resource-num' => 'doi',
				'pages' => 'pages',
				'volume' => 'volume',
				'number' => 'number',
				'section' => 'section',
				'abstract' => 'abstract',
				'isbn' => 'isbn',
				'notes' => 'notes',
				'research-notes' => 'research-notes',
				'label' => 'label',
				'caption' => 'caption',
				'language' => 'language',
				'remote-database-provider' => 'database-provider',
				'remote-database-name' => 'database',
				'work-type' => 'work-type',
				'custom1' => 'custom1',
				'custom2' => 'custom2',
				'custom3' => 'custom3',
				'custom4' => 'custom4',
				'custom5' => 'custom5',
				'custom6' => 'custom6',
				'custom7' => 'custom7',
			) as $enkey => $ourkey) {
				if (! $find = $record->xpath("$enkey/style/text()") )
					continue;
				$ref[$ourkey] = $this->_GetText($find);
			}
			$ref = $this->parent->ApplyFixes($ref);

			if (!$this->parent->refId) { // Use indexed array
				$this->parent->refs[] = $ref;
			} elseif (is_string($this->parent->refId)) { // Use assoc array
				if ($this->parent->refId == 'rec-number') {
					// Stupidly convert the XML object into an array - wish there were some easier way to do this but xPath doesnt seem to watch to match 'rec-number/text()'
					$recArr = (array) $record;
					$recno = (int) $recArr['rec-number'];
					if (!$recno) {
						trigger_error('No record number to associate reference to');
						$this->parent->refs[$ref[$this->parent->refId]] = $ref;
					} else {
						$this->parent->refs[$recno] = $ref;
					}
				} elseif (!isset($ref[$this->parent->refId])) {
					trigger_error("No ID found in reference to use as key");
				} else {
					$this->parent->refs[$ref[$this->parent->refId]] = $ref;
				}
			}
		}
		if ($this->parent->refId == 'rec-number') // Resort by keys so that everything is in order
			ksort($this->parent->refs);
	}

}

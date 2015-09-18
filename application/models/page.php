<?
class Page extends CI_Model {
	function GetSteps() {
		return array(
			'How to Ask a question',
			'Finding previous systematic reviews',
			'Write the protocol',
			'Developing the search stratergy',
			'Running searches &amp; de-duplication',
			'Initial screening of titles and abstracts',
			'Finding full-text',
			'Screening full-text',
			'Reference and citation checks',
			'Data extraction from included studies',
			'Meta-analysis',
			'Write up',
		);
	}

	function GetByCode($code) {
		$this->db->from('pages');
		$this->db->where('code', $code);
		$this->db->limit(1);
		return $this->db->get()->row_array();
	}

	/**
	* Takes an array of vars and replaces all those inside square brackets with the equivelent value
	* @param string $text The blob of text to process
	* @param array $vars The array of PHP variables to replace
	*/
	function Replace($text, $vars) {
		$replacements = array();
		foreach ($vars as $k => $v)
			$replacements["[$k]"] = $v;
		return strtr($text, $replacements);
	}
}

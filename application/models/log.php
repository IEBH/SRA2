<?
class Log extends CI_Model {
	/**
	* Add a log entry
	* @param string $icon The icon to associate with the log entry (ommit the 'icon-' prefix for FontAwesome)
	* @param string $text The text of the log entry
	* @param string $userid Force a userid to be used instead of using _SESSION
	*/
	function Add($icon, $text, $userid = null) {
		if (!$userid)
			$userid = (isset($_SESSION['user']['userid']) ? $_SESSION['user']['userid'] : null);
		$this->db->set('userid', $userid);
		$this->db->set('icon', $icon);
		$this->db->set('text', $text);
		$this->db->set('created', time());
		$this->db->insert('logs');
	}

	function GetAll($offset = 0, $limit = 100, $search = null, $where = null) {
		$this->db->from('logs');
		$this->db->order_by('created desc');
		$this->db->limit($limit, $offset);
		if ($where)
			$this->db->where($where);
		if ($search)
			$this->db->where('MATCH(text) AGAINST (\'*' . substr($this->db->escape($search), 1, -1) . '*\' IN BOOLEAN MODE)');
		return $this->db->get()->result_array();
	}


	/**
	* Returns a nicely readable array
	* e.g. something = new_value1, something2 = new_value2
	* or item1, item2, item3
	* @param array $arr The array to niceify
	* @param string $splitter Use this string to seperate entities
	* @return string The human readble content of the array
	*/
	function NiceArray($arr, $splitter = ', ') {
		$out = '';
		foreach ($arr as $key => $val)
			if (is_int($key)) {
				$out .= "$val, ";
			} elseif (is_array($val)) {
				$out .= strip_tags($key) . " = " . print_r($val, 1) . $splitter;
			} else
				$out .= strip_tags($key) . " = '" . strip_tags($val) . "'" . $splitter;
		return rtrim($out, $splitter);
	}

	/**
	* Returns the difference between array1 and array2
	* This is usually used when saving items
	* e.g. $this->Log->Add('edit', 'Edited project: ' . $this->Log->DiffArray($old, $saved))
	* @param array $a The first array to compare (the old array)
	* @param array $b The new array to compare
	* @param bool $nicearray Run the result though NiceArray() and return a string if true, otherwise return the array
	* @param array|string $ignore Either a single key or array of keys not to include in the output
	* @return array|string If $nicearray, the result difference between $a and $b otherwise an array of differences
	*/
	function DiffArray($a, $b, $nicearray = TRUE, $ignore = array()) {
		if (!is_array($ignore))
			$ignore = (array) $ignore;
		$out = array();
		foreach ($b as $key => $val)
			if (isset($a[$key]) && ($a[$key] != $b[$key]) && !in_array($key, $ignore))
				$out[$key] = $val;
		return $nicearray ? $this->NiceArray($out) : $out;
	}
}
?>

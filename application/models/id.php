<?
/**
* Matts little unique ID system
* This library contains a number of useful functions for uniquely identifying table records as an alternative to using 'auto_increment'
*
*	$this->load->model('ID');
*	$id = $this->ID->Create('users'); // Generate a new ID for the table 'users'
*
* @author Matt Carter <m@ttcarter.com>
*/
class ID extends CI_Model {
	/**
	* Possible values to generate IDs from
	* This set should be as large as possible to prevent collisions
	* @var array
	*/
	var $salt;

	/**
	* The length that generated IDs should be
	* @var int
	*/
	var $saltlen;


	/**
	* The maximum number of tries to generate a unique ID on calls to Create() before giving up with an error
	* @var int
	*/
	var $maxtries;

	function __construct() {
		parent::__construct();
		$this->salt = array(
			'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
			'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
			'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
		);
		$this->saltlen = 8;
		$this->maxtries = 10;
	}

	/**
	* Generate a new ID
	* @return string An ID composed of 8x junk with a-z, A-Z, 0-9
	*/
	function Generate() {
		$out = '';
		for ($i = 0; $i < $this->saltlen; $i++)
			$out .= $this->salt[mt_rand(0, count($this->salt)-1)];
		return $out;
	}

	/**
	* Generate a new ID and check that its not in use within a given table
	* This function uses the default CI DB system to query the table until a unique ID is found
	* @param string $table The table to search (e.g. 'users')
	* @param string $column The column name to search (if null this is assumed to be the none-plural version of $table with 'id' appended e.g. 'userid')
	* @return The unique ID for the table
	*/
	function Create($table, $column = null) {
		if (!$column) { // Determine $column as singular($table) . 'id'
			$this->load->helper('inflector');
			$column = singular($table) .  'id';
		}

		$try = 0;
		while ($try++ < $this->maxtries) {
			$id = $this->Generate();
			$this->db->select('COUNT(*) AS count');
			$this->db->where($column, $id);
			$this->db->from($table);
			$result = $this->db->get()->row_array();
			if ($result['count'] == 0)
				return $id;
		}
		trigger_error("Cannot find unique ID for table $table.$column after $try tries");
		return FALSE;
	}
}
?>

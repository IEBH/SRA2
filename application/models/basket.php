<?
class Basket extends CI_Model {
	function __construct() {
		parent::__construct();
		// New Session - Basket {{{
		if (!isset($_SESSION['basket']))
			$_SESSION['basket'] = array();
		// }}}
	}

	function GetAll() {
		return $_SESSION['basket'];
	}

	function Add($ref, $data) {
		$_SESSION['basket'][$ref] = $data;
	}

	function Remove($ref) {
		unset($_SESSION['basket'][$ref]);
	}

	function Clear() {
		$_SESSION['basket'] = array();
	}

	function Has($ref) {
		return isset($_SESSION['basket'][$ref]);
	}
}

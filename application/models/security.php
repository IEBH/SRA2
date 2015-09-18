<?
class Security extends CI_Model {
	/**
	* Checks that the user is logged in.
	* If not the user is directed to the login page
	* @param string $redirect The URL to redirect to if the user is not logged in
	* @return void This function is fatal if the user is not logged in
	*/
	function EnsureLogin($redirect = '/login') {
		if (!isset($_SESSION['user'])) // Not logged in
			$this->site->Redirect($redirect);
	}

	/**
	* Ensure that the user is an admin
	* @return void This function is fatal if the user is not logged in or is not an admin
	*/
	function EnsureAdmin() {
		if (!$this->User->IsAdmin())
			$this->site->Error('Sorry but you do not have the requisite user level to preform that operation');
	}

	/**
	* Similar to EnsureAdmin() but checks that the user is actually the root user
	* @return void This function is fatal if the user is not logged in or is not root
	*/
	function EnsureRoot() {
		if (!$this->User->IsRoot())
			$this->site->Error('Sorry but you must be the root user to perform this operation');
	}
}
?>

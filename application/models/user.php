<?
class User extends CI_Model {
	/**
	* Retrieve a single user record
	* @param int $userid The UserID to retrieve
	* @return array Assoc array of the user record
	*/
	function Get($userid) {
		$this->db->from('users');
		$this->db->where('userid', $userid);
		$this->db->limit(1);
		return $this->db->get()->row_array();
	}

	function Count($where = null) {
		$this->db->select('COUNT(*) AS count');
		$this->db->from('users');
		if($where)
			$this->db->where($where);
		$result = $this->db->get()->row_array();
		return $result['count'];
	}
	
	function GetByEmail($email) {
		$this->db->from('users');
		$this->db->where('email', $email);
		$this->db->limit(1);
		return $this->db->get()->row_array();
	}
	
	/**
	* Retrieve multiple user records
	* @param array $where Optional where condition
	* @param string $orderby Optional order_by condition
	* @param int $limit Optional number of records to return
	* @param int $offset Optional offset of records to return
	*/
	function GetAll($where = null, $orderby = null, $limit = 100, $offset = 0) {
		$this->db->from('users');
		if ($where)
			$this->db->where($where);
		if ($orderby)
			$this->db->order_by($orderby);
		$this->db->limit($limit,$offset);
		return $this->db->get()->result_array();
	}

	/**
	* Retruns the active user or retrives a single value from his data
	* @param string $option Either null for the entire user object or the single item to return the value of
	* @param bool $real Force the use of 'realrole' instead of the cached one.
	*/
	function GetActive($property = null, $real = FALSE) {
		if (!isset($_SESSION['user']))
			return FALSE;

		if ($real && $property == 'role')
			return isset($_SESSION['user']['realrole']) ? $_SESSION['user']['realrole'] : FALSE;

		if ($property)
			return isset($_SESSION['user'][$property]) ? $_SESSION['user'][$property] : FALSE;

		//Grab and attach the user's company information for authentication in controllers elsewhere
		$user = $_SESSION['user']; 
		return $user;
	}

	var $cachednames = array();
	/**
	* Fast access function to simply return a user name
	* This function uses caching and ONLY returns one item of data
	* @param array|int $userid Either the UserID to retrieve, or the array object of the user to use or if null the current user is used
	* @param bool $short Try and return a friendly short name
	* @return string The user name of the requested user
	*/
	function GetName($userid = null, $short = FALSE) {
		if (!$userid) { // Try to use logged in user, otherwise fail
			if (!$record = $this->GetActive())
				return FALSE;
		} else if (is_numeric($userid)) {
			if (isset($this->cachednames[$userid])) // Dont bother pulling the record if we already have the result cached
				return $this->cachednames[$userid];
			$this->db->select('fname, lname, email');
			$this->db->from('users');
			$this->db->where('userid', $userid);
			$this->db->limit(1);
			$record = $this->db->get()->row_array();
		} else {	
			$record = $userid;
		}

		if (!isset($record['userid']) || !isset($record['fname'])) {
			return 'User';
		} elseif (isset($this->cachednames[$record['userid']])) {
			return $this->cachednames[$record['userid']];
		} elseif ($record['fname'] && $short) {
			$this->cachednames[$record['userid']] = ucfirst($record['fname']);
		} elseif ($record['fname'] && $record['lname']) {
			$this->cachednames[$record['userid']] = ucfirst($record['fname']) . ' ' . ucfirst($record['lname']);
		} elseif ($record['fname']) {
			$this->cachednames[$record['userid']] = ucfirst($record['fname']);
		} elseif ($record['lname']) {
			$this->cachednames[$record['userid']] = ucfirst($record['lname']);
		} else
			$this->cachednames[$record['userid']] = $record['email'];
		return $this->cachednames[$record['userid']];
	}

	/**
	* Return true if the current user is an admin
	* @param bool $real Use the real role obtrained during login rather than the current role which may have been set via controllers/users/changerole
	* @return bool TRUE if the user is admin
	*/
	function IsAdmin($real = FALSE) {
		return in_array($this->GetActive('role', $real), array('admin', 'root'));
	}

	/**
	* Return true if the current user is root
	* @param bool $real Use the real role obtrained during login rather than the current role which may have been set via controllers/users/changerole
	* @return bool TRUE if the user is root
	*/
	function IsRoot($real = FALSE) {
		return ($this->GetActive('role', $real) == 'root');
	}

	/**
	* Binds the current session user with a specified user record
	* This function sets up the session, updates login information and all other tasks assocaietd with logging in
	* @param string $userid The UserID of the user to bind to
	* @param bool|string $redirect If true, this function is fatal and redirects to the main home page of that users account. If its a string the string is used as the redirection URI
	* @param string $method Optional descriptive string on how the user logged in (e.g. 'Facebook')
	*/
	function Login($userid, $redirect = TRUE, $method = null) {
		$_SESSION['user'] = $this->Get($userid);

		$this->Log->Add('key', "Login for user {$_SESSION['user']['username']}", $userid);

		if ($redirect)
			$this->site->Redirect(is_string($redirect) ? $redirect : '/');
	}

	/**
	* Attempt to retrive a user login by a plaintext email and password combo
	* @param string $username The username to test
	* @param string $password The attempted password
	* @return array The user record or null
	*/
	function GetByLogin($username, $password) {
		$this->db->from('users');
		$this->db->where('username', $username);
		$this->db->limit(1);
		if (! $user = $this->db->get()->row_array()) // Invalid user
			return FALSE;
		if ($this->HashCmp($password, $user['passhash'], $user['userid'])) { // Match primary password
			return $user;
		} elseif ($this->HashCmp($password, $user['passhash2'], $user['userid'])) { // Match secondary password
			$this->Log->Add('login', 'Swapped to secondary password', null, $user['userid']);
			$this->db->where('userid', $user['userid']); // Swap secondary -> primary passwords
			$this->db->update('users', array(
				'passhash' => $user['passhash2'],
				'passhash2' => null,
			));
			return $user;
		}
		return FALSE;
	}

	/**
	* Set a passhash field
	* Passhashes are 8x hex junk + $value as an Md5
	* @param string $value The value that will be hashed
	* @param string $salt Force a salt value (this is used by the HashCmp function)
	* @return string A salt+value string in the form <salt*8><md5>
	* @see HashCmp
	*/
	function HashSet($value, $salt = null) {
		if (!$salt) { // Force the salt value
			$junk = array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f');
			$salt = '';
			foreach (range(1, 8) as $offset)
				$salt .= $junk[rand(0, 15)];
		}
		return $salt . md5("$salt$value");
	}

	/**
	* Compares an incomming value against a hash
	* NOTE: This password accepts both hashed passwords (v2 style) and plaintext passwords (v1 style). Anyone logging in with a plaintext password gets it converted to a v2 hash
	* @param string $value The plain text value to compare the hash against
	* @param string $hash The hashed password usually drawn from a database record
	* @param int $userid Optional userid. If provided and the above hash is a WP password it will be converted
	*/
	function HashCmp($value, $hash, $userid = null) {
		if (!$hash && $value)
			return FALSE;
		if (strlen($hash) == 40) { // Use 8/salt+32/md5
			$salt = substr($hash, 0, 8); // Figure out the salt of the incomming string
			return ($this->HashSet($value, $salt) == $hash); // ... and use it to create a new hash
		} elseif ($value == $hash) { // Try validating against previous systems plaintext passwords (blegh!)
			if ($userid) // Given a userID to save back to - now convert the pass to the new style
				$this->Save($userid, array('password' => $value));
			return TRUE;
		} else {
			return FALSE;
		}
	}

	/**
	* Sets the secondary password to something random
	* @param int $userid The user ID to set the secondary of
	* @return string The new password that was set
	*/
	function SetSecondaryPass($userid) {
		$password2 = pick(qw('capricorn aquarius pisces aries taurus gemini virgo libra scorpio')) . rand(10,99);
		$this->db->where('userid', $userid);
		$this->db->update('users', array(
			'passhash2' => $this->HashSet($password2),
		));
		$this->Log->Add('user', 'Setup secondary password recovery for user', null, $userid);
		return $password2;
	}

	/**
	* Creates a new user in the user table
	* @param array $data Data that should be used to create the user
	* @return int Either the new user ID or false
	*/
	function Create($data) {
		$fields = array();
		foreach (qw('username fname lname email') as $field)
			if (isset($data[$field]))
				$fields[$field] = $data[$field];

		if (isset($data['email']) && empty($data['username']))
			$fields['username'] = $data['email'];

		if ($fields) {
			$fields['created'] = time();
			if (isset($data['password']))
				$fields['passhash'] = $this->HashSet($data['password']);
			$this->db->insert('users', $fields);
			return $this->db->insert_id();
		} else {
			return FALSE;
		}
	}

	function Save($userid, $data) {
		$fields = array();
		
		//Allow authenticated admins to change the company assigned to a user
		foreach (qw('fname lname username email') as $field)
			if (isset($data[$field]))
				$fields[$field] = $data[$field];
		if (isset($data['password']))
			$fields['passhash'] = $this->HashSet($data['password']);
		if (isset($data['email']))
			$fields['username'] = $data['email'];

		if ($fields) {
			$this->db->where('userid', $userid);
			$this->db->update('users', $fields);
			$this->Log->Add('user', "Changed user #$userid details: " . $this->Log->NiceArray($fields));
			if (isset($_SESSION['user']) && $_SESSION['user']['userid'] == $userid) // Changing self
				$_SESSION['user'] = array_merge($_SESSION['user'], $this->Get($userid, TRUE));
			return TRUE;
		} else {
			return FALSE;
		}
	}
}
?>

<?
class Urlpayload extends CI_Model {
	function Get($id) {
		$this->db->from('urlpayloads');
		$this->db->where('urlpayloadid', $id);
		$this->db->limit(1);
		return $this->db->get()->row_array();
	}

	function GetByCode($code) {
		$this->db->from('urlpayloads');
		$this->db->where('code', $code);
		$this->db->where('expiry >=', time());
		$this->db->limit(1);
		return $this->db->get()->row_array();
	}

	/**
	* Create a new URL Payload and return its URL
	* @param array $data Array data used to create the URL
	* @return string The URL to access the resource
	*/
	function Create($data) {
		$this->load->model('ID');
		$fields = array();
		foreach (qw('command payloadid expiry') as $field)
			if (isset($data[$field]))
				$fields[$field] = $data[$field];
	
		if ($fields) {
			if (!isset($fields['expiry']))
				$fields['expiry'] = URLPAYLOAD_DEFAULT_EXPIRY;
			$fields['created'] = time();

			$fields['code'] = $this->ID->Create('urlpayloads', 'code');

			$this->db->insert('urlpayloads', $fields);

			return strtr(URLPAYLOAD_URL, array('[CODE]' => $field['code']));
		} else {
			return FALSE;
		}
	}

	function Clean() {
		$this->db->where('expiry <', time());
		$this->db->set('status', 'expired');
		$this->db->update('urlpayloads');
	}

	function SetStatus($urlpayloadid, $status) {
		$this->db->where('urlpayloadid', $urlpayloadid);
		$this->db->set('status', $status);
		$this->db->update('urlpayloads');
	}

	function Claim($payload) {
		switch ($payload['command']) {
			case 'share':
				if (!$this->User->GetActive()) { // User is not logged in
					$_SESSION['post_login_url'] = strtr(URLPAYLOAD_URL, array('[CODE]' => $payload['code']));
					$this->site->Redirect('/login/share');
				} else {
					$this->Library->AddUser($this->User->GetActive('userid'), $payload['payloadid']);
					$this->SetStatus($payload['urlpayloadid'], 'claimed');
					$this->site->Redirect("/libraries/view/{$payload['payloadid']}");
				}
				break;
			default:
				trigger_error('Unknown payload command: ' . $payload['command']);
		}
	}
}

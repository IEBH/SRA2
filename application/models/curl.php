<?
class Curl extends CI_Model {
	function GetCached($url, $data = null) {
		$hash = md5($url . ($data ? http_build_query($data) : null));
		$this->db->select('content');
		$this->db->from('wwwcache');
		$this->db->where('hash', $hash);
		$this->db->limit(1);
		return ($result = $this->db->get()->row_array()) ? $result['content'] : null;
	}

	function SaveCached($url, $data = null, $content = null) {
		$hash = md5($url . ($data ? http_build_query($data) : null));
		$this->db->where('hash', $hash);
		$this->db->delete('wwwcache');

		$this->db->insert('wwwcache', array(
			'hash' => $hash,
			'age' => time(),
			'content' => $content,
		));
	}

	function Fetch($url, $data = null, $usecache = TRUE) {
		if ($usecache && $content = $this->GetCached($url, $data)) {
			return $content;
		} else {
			$curl = curl_init();
			curl_setopt($curl, CURLOPT_URL, $url);
			curl_setopt($curl, CURLOPT_HEADER, 0);
			curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($curl, CURLOPT_FOLLOWLOCATION, 1);
			curl_setopt($curl, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.1) Gecko/20061204 Firefox/2.0.0.1');
			if ($data) {
				curl_setopt($curl, CURLOPT_POST, 1);
				curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($data));
			}

			if(!$content = curl_exec($curl))
				$this->site->Error('CURL Error: ' . curl_error($curl));

			if (!mysql_ping()) { // If the MySQL connection dropped (WHO connections can take AGES) reestablish
				$this->db->close();
				$this->db->initialize();
			}

			$this->SaveCached($url, $data, $content);
			return $content;
		}
	}
}

<?
class Tinyurls extends CI_Controller {
	function __construct() {
		parent::__construct();
	}

	function View($code) {
		$this->load->model('Urlpayload');
		$this->Urlpayload->Clean();
		if ($payload = $this->Urlpayload->GetByCode($code)) {
			$this->Urlpayload->Claim($payload);
		} else {
			$this->site->Error('Sorry but nothing was was found with that access code');
		}
	}
}


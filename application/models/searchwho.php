<?
class Searchwho extends CI_Model {
	function __construct() {
		parent::__construct();
		$this->load->model('Curl');
		// New Session - WHO {{{
		if (!isset($_SESSION['who_session'])) {
			$session_content = $this->Curl->Fetch('http://apps.who.int/trialsearch/Default.aspx');
			$_SESSION['who_session'] = array();
			preg_match_all('!<input type="hidden" name="(__.*?)" id="\1" value="(.*?)" />!', $session_content, $matches, PREG_SET_ORDER);
			foreach ($matches as $match)
				$_SESSION['who_session'][$match[1]] = $match[2];
		}
		// }}}
	}

	function GetAll($terms) {
		$post = $_SESSION['who_session'];
		$post['Button1'] = 'Search';
		$post['TextBox1'] = $terms;

		$content = $this->Curl->Fetch('http://apps.who.int/trialsearch/Default.aspx', $post);
		preg_match_all('!<a id=".*?" href="Trial\.aspx\?TrialID=(.*?)" target="_blank">(.*?)</a>!s', $content, $matches, PREG_SET_ORDER);

		$papers = array();
		foreach ($matches as $match)
			$papers[$match[1]] = array(
				'paperid' => $match[1],
				'source' => 'WHO',
				'url' => "/search/who/paper/{$match[1]}",
				'name' => $match[2],
				'in-basket' => isset($_SESSION['basket'][$match[1]]),
			);
		return $papers;
	}

	function Get($ref) {
		$content = $this->Curl->Fetch("http://apps.who.int/trialsearch/Trial.aspx?TrialID=$ref");
		$paper = array(
			'ref' => $ref,
			'url-who' => "http://apps.who.int/trialsearch/trial.aspx?trialid=$ref",
			'url' => "/search/who/paper/$ref",
			'source' => 'who',
		);

		preg_match('!Register.*?<span.*?>(.*?)</span>!sm', $content, $matches);
		$paper['register'] = $matches[1];
		preg_match('!Last refreshed on.*?<span.*?>(.*?)</span>!sm', $content, $matches);
		$paper['date-refresh'] = $matches[1];
		preg_match('!Date of registration.*?<span.*?>(.*?)</span>!sm', $content, $matches);
		$paper['date-reg'] = $matches[1];
		preg_match('!Date of first enrolment.*?<span.*?>(.*?)</span>!sm', $content, $matches);
		$paper['date-enrolment'] = $matches[1];
		preg_match('!Primary sponsor.*?<span.*?>(.*?)</span>!sm', $content, $matches);
		$paper['sponsor'] = $matches[1];
		preg_match('!Public title.*?<span.*?>(.*?)</span>!sm', $content, $matches);
		$paper['title'] = $paper['title-public'] = $matches[1];
		preg_match('!Scientific title.*?<span.*?>(.*?)</span>!sm', $content, $matches);
		$paper['title-scientific'] = $matches[1];
		preg_match('!Target sample size.*?<span.*?>(.*?)</span>!sm', $content, $matches);
		$paper['target-sample-size'] = $matches[1];
		preg_match('!Recruitment status.*?<span.*?>(.*?)</span>!sm', $content, $matches);
		$paper['recruitment-status'] = $matches[1];
		preg_match('!URL:.*?<a id=".*?" href="(.*?)"!sm', $content, $matches);
		$paper['url'] = $matches[1];
		preg_match('!Study type.*?<span.*?>(.*?)</span>!sm', $content, $matches);
		$paper['study-type'] = $matches[1];
		preg_match('!Study design.*?<td.*?>(.*?)</td>!sm', $content, $matches);
		$paper['study-design'] = $this->Clean(strtr($matches[1], array('</span>' => ', ', '<br>' => ', ', '<br/>' => ', ')));
		$paper['study-design'] = trim(trim($paper['study-design'], ','));

		preg_match('!Name:.*?<td.*?>(.*?)</td>!sm', $content, $matches);
		$paper['contact-name'] = $this->Clean($matches[1]);
		preg_match('!Email:.*?<td.*?>(.*?)</td>!sm', $content, $matches);
		$paper['contact-email'] = $this->Clean($matches[1]);

		preg_match('!Primary Outcome\(s\).*?<tr.*?>(.*?)</table>!sm', $content, $matches);
		$paper['primary-outcomes'] = $this->Clean(strtr($matches[1], array('</td>' => ', ')));
		$paper['primary-outcomes'] = trim(trim($paper['primary-outcomes'], ','));

		return $paper;
	}

	function Clean($string) {
		$string = strip_tags($string);
		$string = trim(strtr($string, array('&nbsp;' => ' ')));
		$string = preg_replace('/\s+/', ' ', $string);
		$string = preg_replace('/\s+,/', ',', $string);
		return $string;
	}
}

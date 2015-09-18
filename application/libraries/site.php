<?
/**
* Matts little 'site' library
* Contains useful site wide functionality
*
* This module ships with the views/site directory
*/
class Site {
	/**
	* Whether the headers have been spewed
	* @var bool
	*/
	var $_spewed_headers;

	/**
	* Which theme to use
	* Determined on the first call to ->Header
	* @type string
	*/
	var $Theme;

	/**
	* Output JSON options
	* @type int
	*/
	var $_jsonoptions;

	/**
	* CodeIgniter reference
	* @type CodeIgniter
	*/
	var $CI;

	/**
	* The parameters given to the header/footer calls
	* @type array
	*/
	var $headerparams;

	function Site() {
		$GLOBALS['messages'] = array();
		$this->Theme = 'normal';
		$this->CI =& get_instance();
	}

	/**
	* Force the local theme id
	* @param string $theme The theme id to use when rendering
	*/
	function SetTheme($theme) {
		$this->Theme = $theme;
	}

	/**
	* Output a template header
	*
	* @param string $title The title of the page
	* @param array $params Other parameters to output to the header page
	* @param string $params['title'] The title of the page
	* @param bool $params['span'] Whether to enclose the sub-page in a span element
	*/
	function Header($title = 'Welcome', $params = array()) {
		if (isset($_POST['ajax'])) {
			$this->CI->load->view('site/messages');
			return;
		}
		header("Content-Type: text/html; charset=utf-8");

		$params['title'] = $title;
		$params['span'] = isset($params['span']) ? $params['span'] : true;
		$this->headerparams = $params;

		$this->CI->load->view('site/' . $this->Theme . '/header', $params);
		$this->_spewed_headers = TRUE;
	}

	/**
	* Display the footer of the page
	*/
	function Footer() {
		if (isset($_POST['ajax']))
			return;
		$this->CI->load->view('site/' . $this->Theme . '/footer', $this->headerparams);
	}

	/**
	* Shorthand function to include another view
	*/
	function View($view, $params = null) {
		$this->CI->load->view($view, $params);
	}

	/**
	* Output a simple (non-error) string to the user
	* Unlike error() this function is NOT fatal
	* @param string $text The text to display
	* @param bool $close If TRUE the footer is appended to the message
	*/
	function Text($text, $close = TRUE) {
		if ($close && !$this->_spewed_headers)
			$this->Header(SITE_TITLE);
		$this->CI->load->view('text', array(
			'text' => $text,
		));
		if ($this->_spewed_headers && $close)
			$this->Footer();
	}

	/**
	* Convenience wrapper to output JSON output
	* If mappings is an array it can be used to extract infomormation from the json incomming array
	* e.g.
	* $this->JSON(array('name' => 'John', 'userid' => 10), array('name' => 'name', 'id' => 'userid')) == array(array('id' => 10, 'name' => 'John'))
	* @param array $json The associative JSON output
	*/
	function JSON($json, $mappings = null) {
		header("Expires: Mon, 26 Jul 1997 05:00:00 GMT" ); 
		header("Last-Modified: " . gmdate( "D, d M Y H:i:s" ) . "GMT" ); 
		header("Cache-Control: no-cache, must-revalidate" ); 
		header("Pragma: no-cache" );
		header('Content-type: application/json');
		if ($mappings) { // Recompute mappings
			$out = array();
			foreach ($json as $bit)
				foreach ($mappings as $key => $val)
					$out[$key] = $bit[$val];
			$json = $out;
		}
		echo json_encode($json, $this->_jsonoptions);
		exit;
	}

	/**
	* Convenience function for reporting errors
	* @param string $message The error message to display
	* @return void This function is fatal
	*/
	function Error($message) {
		if (!$this->_spewed_headers)
			$this->Header('Error');
		$this->CI->load->view('text', array(
			'text' => $message,
		));
		$this->Footer();
		$this->Terminate();
	}

	/**
	* Append simple text to the output buffer
	* @param string $html HTML to append
	*/
	function Append($html) {
		#global $OUT;
		#$OUT->append_output($html);
		echo $html;
	}

	/**
	* Directly output remaining output buffer contents and exit
	*/
	function Terminate() {
		global $OUT;
		echo $OUT->get_output();
		exit;
	}

	/**
	* Trigger a 404 error
	* This function is always fatal
	*/
	function Error404() {
		header('HTTP/1.0 404 Not Found');
		echo "<h1>404 Not Found</h1>";
		echo "The page that you have requested could not be found.";
		exit();
	}

	/**
	* Fatal redirect to another address
	* If $text is set this function will do a soft redirect
	*
	* @param string $url The URL to redirect
	* @param string $text Optional text to display while redirecting
	* @return void This function is always fatal
	*/
	function Redirect($url, $text = null) {
		if (!$text && !headers_sent()) { // Hard redirect
			header("Location: $url");
			exit;
		} else {
			$this->CI->load->view('redirect', array(
				'url' => $url,
				'text' => ($text) ? $text : 'Redirecting...',
			));
		}
	}

	/**
	* Redirect backwards to the previous page
	* If the previous page is not available use the provided URL instead
	* This is really just a convenience function for Redirect()
	* @param string $url The URL to redirect to if the referer URL is not available
	*/
	function RedirectBack($url = '/') {
		$this->Redirect(isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : $url);
	}

	/**
	* Checks that the user is not posting the same thing twice
	* If URL is specified, a fatal call to ->Redirect is made if the post is not unique
	* If URL is not specified this function returns FALSE, otherwise TRUE
	*
	* @param string $url Redirect here if the post is not unique
	* @return bool This function is a fatal call to ->Redirect if the post is not unique and URL is set, otherwise FALSE if not unique
	*/
	function UniquePost($url = null) {
		if (!$_POST) return TRUE; // No post anyway
		$bulk = '';
		foreach ($_POST as $key => $val)
			$bulk .= "$key=$val&";
		$md5 = md5($bulk);
		if (isset($_SESSION['unique_post']) && ($_SESSION['unique_post'] == $md5) ) { // Same MD5 as last time
			if ($url)
				$this->Redirect($url);
			return FALSE;
		}
		$_SESSION['unique_post'] = $md5;
		return TRUE;
	}

	/**
	* Adds a message to the stack
	* @param string $type The type of message (enum of: info, warning, delete, create)
	* @param string|array $text The message content to add. If the text is an array it will be enclosed in <ul> tags with each element as a <li>
	*/
	function Message($type, $text) {
		if (is_array($text)) {
			$out = '<ul>';
			foreach ($text as $item)
				$out .= "<li>$item</li>";
			$text = "$out</ol>";
		}
		$GLOBALS['messages'][] = array($type, $text);
	}

	/**
	* Returns if any messages are pending
	* @return bool Any messages waiting from calls to Message()
	* @see Message
	*/
	function HasErrs() {
		return (count($GLOBALS['messages']) > 0);
	}

	/**
	* Immediately sprews a message to the output buffer.
	* This function is what renders the Message() output and is included here in case a message ever needs to be output at a specific location
	* @param string $type The type of message (enum of: info, warning, delete, create)
	* @param string|array $text The message content to add. If the text is an array it will be enclosed in <ul> tags with each element as a <li>
	* @param bool $return Return the blob rather than echo it
	* @see Message()
	*/
	function MessageHere($type, $text, $return = false) {
		$out = "<div class=\"alert alert-$type\">$text</div>";
		if ($return) {
			return $out;
		} else
			echo $out;
	}

	/**
	* Count the number of errors in the message table
	* @return int The number of messages in the queue
	*/
	function CountMessages() {
		return count($GLOBALS['messages']);
	}

	/**
	* Checks for the existance of $_POST[$name] or fatally errors out
	* @return void This funciton is fatal if $_POST[$name] does not exist
	*/
	function RequireVar($name, $description) {
		if (!isset($_POST[$name]))
			$this->Error("POST '$name' is required - $description");
	}

	/**
	* Extract an array of parameters from a function arg stack
	* This is usually called with $this->site->Params(func_get_args());
	* so /controller/method/filter1/value1/filter2/value2 => array('filter1' => 'value1', 'filter2' => 'value2')
	* @param $stack array The argument stack to process
	*/
	function Params($stack) {
		$this->_params = array();
		$iskey = 0;
		foreach ($stack as $item) {
			$iskey = !$iskey;
			if ($iskey) {
				$key = $item;
			} else
				$this->_params[$key] = $item;
		}
		return $this->_params;
	}
	
	/**
	* Return an edited version of the URL but override the specified parameter
	* e.g. <a href="<?=$this->site->EditParams('page', $page+1)?>">Next page</a>
	* @param string $param The parameter to edit
	* @param string $value The new value to use. Set to false or do not specify to remove
	*/
	function EditParams($param, $value = FALSE) {
		$replacenext = 0;
		$replaced = 0;
		$url = '/';
		foreach ($this->CI->uri->segments as $seg) {
			if ($seg == $param) {
				$replacenext = 1;
				if ($value !== FALSE)
					$url .= $seg . '/';
			} elseif ($replacenext) {
				if ($value !== FALSE)
					$url .= $value . '/';
				$replacenext = 0;
				$replaced = 1;
			} else
				$url .= $seg . '/';
		}
		if (!$replaced && $value !== FALSE) { // Not replaced - append new parameter
			$url .= "$param/$value";
		} else
			$url = rtrim($url, '/');
		return $url;
	}

	/**
	* Cycle though all files in the Angular directory and include all script files found there
	* @param string $path The root path to search
	* @param string $prefix Optional prefix to include before each included file
	*/
	function IncludeNG($root = 'app', $prefix = '/') {
		$out = "<!-- NG Include -->\n";
		$loadOrder = array(
			'app.js',
			'models/*',
			'directives/*',
			'filters/*',
			'controllers/*',
		);

		foreach ($loadOrder as $load) {
			$out .= $this->_IncludeNGLoader("$root/$load", $prefix == '/' ? '' : $prefix);
		}
		$out .= "<!-- END NG Include -->\n";
		return $out;
	}

	/**
	* IncludeNG worker
	* Recurses though all directories and includes all files
	* @param string $root The starting path to scan
	* @param string $prefix Optional prefix to include before each included file
	*/
	function _IncludeNGLoader($root, $prefix) {
		$out = '';
		foreach (glob($root) as $file) {
			$base = basename($file);
			if ($base == '.' || $base == '..')
				continue;
			if (is_dir($file)) {
				$out .= $this->_IncludeNGLoader($file);
			} elseif (is_file($file)) {
				$out .= "<script src=\"$prefix/$file\"></script>\n";
			}
		}
		return $out;
	}

	// Simple JSON returns {{{
	/**
	* Fatally exit with a JSON error message
	* @param string $message The error to raise
	*/
	function JSONError($message) {
		echo json_encode(array('header' => array('error' => $message)), $this->_jsonoptions);
		exit;
	}

	/**
	* Send a message to the user
	* @param string $message The text to trasmit
	*/
	function JSONInfo($message = null) {
		echo json_encode($message ? array('header' => array('info' => $message)) : array('header' => array()), $this->_jsonoptions);
		exit;
	}

	/**
	* Send a message to the user on success
	* @param string $message The text to trasmit
	*/
	function JSONSuccess($message = null) {
		echo json_encode($message ? array('header' => array('message' => $message)) : array('header' => array()), $this->_jsonoptions);
		exit;
	}
	// }}}
}
?>

<?
/**
* Matts little 'URLOpts' library
* Contains useful functionality to create pretty URLs.
*/
class URLopts {
	/**
	* The contents of the last Get() call to extract the current URL strack
	* @var array
	*/
	var $_opts;

	/**
	* The URL to force this module to use as defined by Set()
	* If this value is non-null the Segments() function will always split this variable rather than magicly trying to figure out the current URL
	* @var null|string
	*/
	var $_url;

	/**
	* How many segments to ignore
	* By default the first three segments are ignored which corresponds to the hostname, CodeIgniter controller and Method
	* @see Ignore()
	* @var int
	*/
	var $_ignore;

	/**
	* Where to accept variables from
	* @var array
	*/
	var $_from;

	function __construct() {
		$this->_ignore = 3;
		$this->_omitserver = 1;
		$this->_from = array('get' => 1, 'post' => 1, 'urlparams' => 1, 'json' => 1);
	}

	/**
	* When constructing an output URL omit the server name
	* This will mean that all output URL's use an absolute path relative to the server
	* @see OmitServer()
	* @var bool
	*/
	var $_omitserver;

	// Convenience Setters {{{
	/**
	* Set whether the server should be omitted from the output URL
	* @param bool $omit Whether the server should be omitted from the output URL
	* @return object This chainable object
	*/
	function OmitServer($omit = TRUE) {
		$this->_omitserver = $omit;
		return $this;
	}

	/**
	* Set the number of URL segments that should be ignored before processing the URL parameters
	* @param int $ignore The number of segments to ignore
	* @return object This chainable object
	*/
	function Ignore($ignore = 3) {
		$this->_ignore = $ignore;
		return $this;
	}

	/**
	* Set whether to merge POST variables with the return of Get()
	* @depreciated Use From() instead
	* @see From()
	* @param bool $post Turn on the POST variable functionality
	* @return object This chainable object
	*/
	function Post($post = true) {
		return $this->From('post', $post);
	}

	/**
	* Sets where parameters can be taken
	* e.g.
	* 	$this->From('get') // Only allow from $_GET
	*	$this->From('get', 0) // Disable from $_GET
	*	$this->From(array('get', 'post')) // Only allow from $_GET and $_POST
	*	$this->From('all') // Allow from all (default behaviour)
	* @param string|array $what Either the individual option to change or an array of all options
	* @param bool $set if $what is a string this sets whether it should be allowed
	* @return object This chainable object
	*/
	function From($where = 'all', $set = TRUE) {
		if ($where === 'all') { // Convenience funciton to turn everything on
			foreach ($this->_from as $k => $v)
				$this->_from[$k] = TRUE;
		} elseif (is_string($where)) {
			$this->_from[$where] = $set;
		} elseif (is_array($where)) {
			$this->_from = $where;
		}
		return $this;
	}
	// }}}

	/**
	* Extract an array of parameters from a function arg stack
	* This is usually called with $this->urlopts->get(func_get_args());
	* so /controller/method/filter1/value1/filter2/value2 => array('filter1' => 'value1', 'filter2' => 'value2')
	* @param null|array $stack The argument stack to process. If no specific stack is specified Segments() is automatically called
	* @param int $ignore Quick method to call Ignore() before processing the stack
	* @return array All extracted key/values as a hash
	*/
	function Get($stack = null, $ignore = null) {
		if ($stack === null)
			$stack = $this->Segments();
		if ($ignore)
			$this->Ignore($ignore);
		$this->_opts = array();
		$iskey = 0;


		if (isset($this->_from['json']) && $this->_from['json']) {
			if (
				( $in = file_get_contents('php://input') ) && // Actually got some raw post data?
				$json = json_decode($in, true) // AND it looks like JSON?
			)
			$this->_opts = $json;
		}

		if (isset($this->_from['urlparams']) && $this->_from['urlparams'])
			foreach ($stack as $index => $item) {
				if ($index < $this->_ignore) // Skip ignored items
					continue;
				$iskey = !$iskey;
				if ($iskey) {
					$key = $item;
				} else
					$this->_opts[$key] = $item;
			}

		if (isset($this->_from['get']) && $this->_from['get'])
			$this->_opts = array_merge($this->_opts, $_GET);
		if (isset($this->_from['post']) && $this->_from['post'])
			$this->_opts = array_merge($this->_opts, $_POST);
		return $this->_opts;
	}

	/**
	* Set the currently active URL.
	* This overrides the default method to magicly determine the active URL
	* @param string $url The URL to force this module to use
	* @return object This chainable object
	*/
	function Set($url) {
		$url = rtrim($url, '/');
		if (substr($url,0,1) == '/') { // Absolute path omitting the server name
			$this->_url = (isset($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : 'server.com') . $url; // Prepend the server or make one up
		} else 
			$this->_url = $url;
		return $this;
	}

	/**
	* Return the URL segments as an array
	* This function will use the CodeIgniter URL library if its present, otherwise it will use the $_SERVER information
	* If Set() was called beforehand that will ALWAYS be used as the current URL
	* @return array An array of URL segments
	*/
	function Segments() {
		if ($this->_url !== null) {
			return explode('/', $this->_url);
		} elseif (function_exists('get_instance')) {
			$CI = get_instance();
			$segments = $CI->uri->segments;
			array_unshift($segments, $_SERVER['SERVER_NAME']);
			return $segments;
		} elseif (isset($_SERVER['REQUEST_URI']) && isset($_SERVER['SERVER_NAME'])) {
			$segments = $_SERVER['REQUEST_URI'];
			array_unshift($segments, $_SERVER['SERVER_NAME']);
			return $segments;
		} else
			trigger_error('urlopts->Segments() - Cant determine the current URI');
	}

	/**
	* Specify a string of URL parameters to add or remove
	*
	* Each parameter to this function is specified in one of the following formats:
	*
	* * foo=bar	- Set the option 'foo' to 'bar'
	* * +foo	- Set the option 'foo' to '1'
	* * -foo	- Remove the option 'foo' from the URL
	*
	* @param string,... $option Edit, Add or remove an option from the URL parameter
	* @return string The URL with the specified corrections applied
	*/
	function Edit() {
		$args = func_get_args();
		$set = array();
		$url = '';
		foreach ($args as $arg) {
			if (substr($arg, 0, 1) == '+') {
				$set[strtolower(substr($arg, 1))] = 1;
			} elseif (substr($arg, 0, 1) == '-') {
				$set[strtolower(substr($arg, 1))] = FALSE;
			} elseif (($bits = explode('=', $arg, 2)) && count($bits) == 2) {
				$set[strtolower($bits[0])] = $bits[1];
			} else
				trigger_error("Unknown call to urlopts->Edit(). Dont know what to do with the string '$arg'. Prefix with '+' to add, '-' to remove to add a '=' to set.");
		}

		$doreplace = FALSE;
		$replacenext = null;
		foreach ($this->Segments() as $index => $seg) {
			if ($index == 0) { // First segment - hostname
				$url = !$this->_omitserver ? $seg . '/' : '/';
			} elseif ($index < $this->_ignore) {
				$url .= "$seg/";
			} elseif (isset($set[$seg])) {
				$doreplace = TRUE;
				$replacenext = $set[$seg];
				if ($replacenext !== FALSE)
					$url .= $seg . '/';
				unset($set[$seg]);
			} elseif ($doreplace) {
				if ($replacenext !== FALSE)
					$url .= $replacenext . '/';
				$doreplace = FALSE;
			} else
				$url .= $seg . '/';
		}
		foreach ($set as $key => $val)
			if ($val !== FALSE)
				$url .= "$key/$val/";
		return rtrim($url, '/');
	}

	/**
	* Executes an Edit() compatible operation on the URL then redirects to the result
	* This function is fatal
	* @param string,... $option The Edit() operation to apply
	* @see Edit()
	*/
	function Go() {
		$args = func_get_args();
		$url = call_user_func_array(array($this, 'edit'), $args);
		header("Location: $url");
		exit();
	}
	
	/**
	* Add a parameter to the URL and return the result
	* e.g. <a href="<?=$this->urlopts->Add('page', $page+1)?>">Next page</a>
	* @param string $param The parameter to add
	* @param string $value Optional new value to use. Set to false or omit to remove
	* @return string The edited URL with the extra parameter added
	*/
	function Add($param, $value = FALSE) {
		$replacenext = 0;
		$replaced = 0;
		$url = '';
		foreach ($this->Segments() as $index => $seg) {
			if ($index == 0) { // First segment
				$url = !$this->_omitserver ? $seg . '/' : '/';
			} elseif ($index < $this->_ignore) { // Ignored segment
				$url .= $seg . '/';
			} elseif ($seg == $param) {
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
	* Remove a parameter from the URL and return the result
	* This function is really just an alias for Add($param, FALSE)
	* @param string $param The parameter to remove
	* @return string The edited URL with the specified parameter removed
	*/
	function Remove($param) {
		return $this->Add($param, FALSE);
	}
}

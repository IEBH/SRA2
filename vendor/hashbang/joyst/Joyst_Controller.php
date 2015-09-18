<?php
/**
* Joyst
* A schema based CodeIgniter extension providing automated model functions
*
* @package Joyst
* @url https://github.com/hash-bang/Joyst
* @author Matt Carter <m@ttcarter.com>
*/

// Sanity checks {{{
if (!function_exists('load_class')) {
	trigger_error("JOYST - Can't find CodeIgniter load_model() function. Try you trying to load Joyst before loading CodeIgniter?");
	die();
}

if (!class_exists('CI_Controller')) // CI not ready yet
	return;

if (class_exists('Joyst_Controller')) // Already loaded?
	return;
// }}}

class Joyst_Controller extends CI_Controller {
	/**
	* The default routing rules used in JoystModel() if no specific rules are specified
	* Routes are applied in the order specified, the first match being the one used
	* @var array
	* @see JoystModel()
	*/
	var $defaultRoutes = array(
		'[JSON]' => 'saveCreate(#)', // Being passed a JSON stream
		'index' => 'getall(#)',
		'get' => 'get(*)',
		'create' => 'create(#)',
		'delete' => 'delete(#)',
		'meta' => 'getSchema()',
		'[JSON]:num' => 'save(1,#)',
		'[DELETE]:num' => 'delete(1)', // If being passed the DELETE method and an ID trigger delete() instead of get()
		':num' => 'get(1)',
		'' => 'getall(#)',
	);

	/**
	* Default options passed to json_encode() to output JSON
	* @var int
	*/
	var $JSONOptions = 0;

	/**
	* Calls to JoystModel are normally fatal (i.e. CodeIgniter will not continue execution after they return)
	* Switching this to false will disable that behaviour
	* @var bool
	*/
	var $fatal = TRUE;

	/**
	* Whether Joyst should set the returnRow option on Joyst_Model to auto return the saved / created row back from the DB
	* @var bool
	*/
	var $returnRow = TRUE;

	/**
	* Convenience wrapper to return if the client is asking for some specific type of output
	* There is a special _GET variable called 'json' which if set forces JSON mode. If set to 'nice' this can also pretty print on JSON() calls
	* @param $type A type which corresponds to a known data type e.g. 'html', 'json'
	* @return bool True if the client is asking for that given data type
	*/
	function RequesterWants($type) {
		switch ($type) {
			case 'html':
				return !$this->Want('json');
			case 'json':
				if (isset($_GET['json'])) {
					if ($_GET['json'] == 'nice' && version_compare(PHP_VERSION, '5.4.0') >= 0)
						$this->JSONOptions = JSON_PRETTY_PRINT;
					return TRUE;
				}
				if (
					isset($_SERVER['HTTP_ACCEPT']) &&
					preg_match('!application/json!', $_SERVER['HTTP_ACCEPT'])
				)
					return TRUE;
				return FALSE;
			case 'put-json': // Being passed IN a JSON blob (also converts incomming JSON into $_POST variables)
				if (!$this->RequesterWants('json')) // Not wanting JSON
					return FALSE;
				$in = file_get_contents('php://input');
				if (!$in) // Nothing in raw POST
					return FALSE;
				$json = json_decode($in, true);
				if ($json === null) // Not JSON
					return FALSE;
				$_POST = $json;
				return TRUE;
			default:
				trigger_error("Unknown want type: '$type'");
		}
	}

	/**
	* Connect to a Joyst_Model and automatically route requests into various model functions
	*
	* Routing is specified in the form 'path' => 'function(parameters...)'
	*
	* Path can be composed of:
	*	* [method] - e.g. '[POST]'. It can also be compound: '[POST,GET]'
	*	* url - Any url
	*
	* Parameters can be one or more of the following seperated by commas:
	* 	* `#` - All remaining parameters as a hash
	*       * `1..9` - A specific numbered parameter from the input
	*       * `*` - All left over parameters in the parameter order
	*
	* @param string $model The name of the CI model (extending Joyst_Model) to use
	* @param array $routes The routing array to use. If unspecified $defaultRoutes will be substituted
	*/
	function JoystModel($model, $routes = null) {
		$gotJSON = FALSE; // Are we being passed a JSON object?

		if (!$this->RequesterWants('json')) // Not wanting JSON - fall though to regular controller which should handle base HTML requests
			return;

		// Process incomming raw JSON {{{
		$in = file_get_contents('php://input');
		if ($in) { // Something in raw POST
			$json = json_decode($in, true);
			if ($json !== null) { // Looks like JSON
				$_POST = $json;
				$gotJSON = TRUE;
			}
		}
		// }}}


		if (!$routes)
			$routes = $this->defaultRoutes;

		$segments = $this->uri->segments;

		array_shift($segments); // Shift first segment - assuming its the controller name

		$segment = $segments ? array_shift($segments) : ''; // Retrieve argument if any

		// Determine the route to use
		foreach ($routes as $routeKey => $dest) {
			$route = $routeKey;
			if (preg_match('!^(.*)\[(.+?)\](.*)$!', $route, $matches)) { // Has a method in the form '[SOMETHING]'
				$blockMatch = false; // Continue executing (set to false to stop)
				foreach (preg_split('/\s*,\s*/', $matches[2]) as $block) { // Split CSV into bits
					switch ($block) {
						// Incomming HTTP methods
						case 'GET':
						case 'PUT':
						case 'DELETE':
						case 'POST':
							if ($_SERVER['REQUEST_METHOD'] == $block) // Found route method does not match this one
								$blockMatch = true;
							break;
						case 'JSON':
							if ($gotJSON)
								$blockMatch = true;
							break;
						default:
							die("Joyst_Controller> Unsupported route query type: $block");
					}
				}
				if (!$blockMatch)
					continue;
				$route = "{$matches[1]}{$matches[3]}"; // Delete from route and continue
			}

			switch ($route) {
				case '':
					if (!$segment) {
						$matchingRoute = $routeKey;
						break 2;
					}
					break;
				case ':num':
					if (is_numeric($segment)) {
						$matchingRoute = $routeKey;
						array_unshift($segments, $segment); // Put the segment back
						break 2;
					}
					break;
				default:
					if ($segment == $route) {
						$matchingRoute = $routeKey;
						break 2;
					}
			}
		}
		

		if (!isset($matchingRoute)) // Didn't find anything matching in routes
			return;
		$rawfunc = $routes[$matchingRoute];

		// Extract any additional parameters
		$params = array_merge($_POST, $_GET);

		if (!preg_match('/^(.+?)\((.*)\)$/', $rawfunc, $matches))
			die('Joyst_Controller: Invalid routing function format. Should be in the format func(), func(a), func(*), func(1) or similar. Given: ' . $func);
		$func = $matches[1];

		// Determine the arguments to be passed to the routing function {{{
		$args = array();
		foreach (explode(',', $matches[2]) as $arg)
			switch ($arg) {
				case '#':
					$args[] = $params;
					break;
				case '1':
				case '2':
				case '3':
				case '4':
				case '5':
				case '6':
				case '7':
				case '8':
				case '9':
					if (!$segments)
						$this->JSONError('Invalid URL format');
					$args[] = $segments[$arg-1];
					break;
				case '*':
					$args = $segments;
					$segments = array();
					break;
			}
		// }}}

		// Call function {{{
		// Check the model is loaded and call the function
		$this->load->model($model);
		if (!is_subclass_of($this->$model, 'Joyst_Model'))
			die("Use of \$this->JoystModel('$model') on a model that does not extend Joyst_Model");
		$this->$model->source = 'controller'; // Tell the model how its been invoked
		// echo "Call \$this->$model->$func(" . json_encode($args) . ")<br/>";
		$this->$model->returnRow = $this->returnRow; // Carry returnRow over into the Model
		$return = call_user_func_array(array($this->$model, $func), $args);
		// }}}

		// Return output {{{
		if (!$this->$model->continue) {
			header('HTTP/1.1 400 Bad Request', true, 400);
			header('X-Error: ' . $this->$model->_EscapeHeader($this->$model->joystError));
			die();
		} else {
			$this->JSON($return);
		}
		// }}}
	}

	/**
	* Output an object or string as JSON
	* @param string|array $object The sting or object to be output as JSON
	* @return null If $this->fatal is TRUE this function will stop execution immediately
	*/
	function JSON($object = null) {
		header("Expires: Mon, 26 Jul 1997 05:00:00 GMT" ); 
		header("Last-Modified: " . gmdate( "D, d M Y H:i:s" ) . "GMT" ); 
		header("Cache-Control: no-cache, must-revalidate" ); 
		header("Pragma: no-cache" );
		header('Content-type: application/json');

		if (is_array($object)) {
			echo json_encode($object, $this->JSONOptions);
		} else if (is_bool($object)) {
			echo 0;
		} else if (is_string($object)) {
			echo $object;
		} else if (is_null($object)) {
			echo 'null';
		} else {
			die('Unknown object type to convert into JSON: ' . gettype($object));
		}

		if ($this->fatal)
			exit;
	}
}

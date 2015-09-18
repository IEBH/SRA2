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
if (class_exists('Joyst_Model')) // Already loaded?
	return;

if (!class_exists('CI_Model')) {
	if (!function_exists('load_class')) {
		trigger_error("JOYST - Can't find CodeIgniter load_model() function. Try you trying to load Joyst before loading CodeIgniter?");
		die();
	} else {
		load_class('Model', 'core');
		if (!class_exists('CI_Model'))
			trigger_error("JOYST - Can't find CI_Model class even after requesting that CodeIgniter loads it via load_class('Model','core'). Something has gone seriously wrong.") && die();
	}
}
// }}}

/**
* Schema (stored in $this->schema):
* form of the array os 'field_name' => array_of_attributes.
*
* Valid attribtues:
* @param string type The type of field, this should correspond with the DB type or: pk - primary key (implies readonly=1), fk - foreign key
* @param int length The length of the field
* @param array|hash options Used if type = 'enum' this contains either an array of options or a hash of possible keys and their human translation
* @param bool readonly Field should not allow saves
* @param bool hide Alias for !allowget setting this will hide the output from all get() and getall() calls
* @param bool|function allowsave Allow this field to be updated in a save() operation (default: true)
* @param bool|function allowcreate Allow this field to be set in a create() operation (default: true)
* @param bool|function allowget Allow this field to be returned in a get() or getall() operation (default: true)
* @param bool|function allowquery Allow this field to be used to filter items (default: true)
*
*
* Triggers:
*	access(&$data) - Function before either a push or pull trigger. Use this to block any read/write access to data.
*	push(&$data) - Function called whenever saving or creating data (before create/delete/deleteall/save triggers). Place any checks for user being logged in to save in here.
*	pull(&$condition) - Function called whenever retrieving data (before count/deleetall/getall/get/getby triggers). Place checks for data security in here.
*	create(&$data) - Used before the insert call in a DB
*	created($id, $data) - Called after the successful insert of a record
*	delete(&$id) - Delete a specific record by its ID if the ID is unset or set to null the operation is aborted (this can be used to remap to a save() call instead)
*	deleted($id, $data) - Called after the successful delete of a record
*	deleteall(&$where, &$orderby) - Similar to getall this trigger is called prior to a DeleteAll() function
*	getall(&$where, &$orderby, &$limit, &$offset) - Used to add additional default parameters to the GetAll() function before it runs
*	getschema(&$schema) - Asked to return a schema map to the caller
*	row(&$row) - Mangling function to rewrite a record (used in Get() and GetAll() functions per row)
*	rows(&$rows) - Fired after the getall() function has completed. Typically used to resort results or further filter records
*	save(&$id, &$data) - Used before the update call in a DB
*	saved($id, $data) - Called after the saving of a record
*	setschema(&$schema) - Schema is loaded
*/
class Joyst_Model extends CI_Model {
	/**
	* Name of this model for tracking purposes
	* This can also be loaded by setting '_model' in $schema
	* @var string
	*/
	var $model = '';

	/**
	* Name of the DB table to manipulate
	* This can also be loaded by setting '_table' in $schema
	* @var string
	*/
	var $table = '';

	/**
	* The schema object
	*
	* @var array
	*/
	var $schema = array();

	/**
	* How this module is being invoked.
	* ENUM of:
	*	internal - via an internal API call
	* 	controller - via a Joyst_Controller interface
	* @var string
	*/
	var $source = 'internal';

	/**
	* Storage for all hooks
	* Use the On(), Off() and Trigger() functions to manage this
	* @see On()
	* @see Off()
	* @see Trigger()
	*/
	var $hooks = array();

	/**
	* List of things to cache the return value of
	* @var array
	*/
	var $cache = array( // What to cache
		'get' => 1,
		'getbasic' => 1,
		'getby' => 1,
		'getall' => 0,
		'count' => 0,
	);

	/**
	* Cache object list. This is usually in the form $_cache[function][id] where function usually is something like 'get'
	* @var array
	* @access private
	*/
	var $_cache = array(); // Actual cache storage

	/**
	* Cached list (computed from $schema) that contains all fields NOT to output
	* @var array
	* @access private
	*/
	var $_hides = array();

	/**
	* Joyst will continue to execute whenever this is true
	* It is auto-set to true on each call to a data function (e.g. get(), getAll() etc.)
	* @var bool
	* @access private
	*/
	var $continue = TRUE;

	/**
	* Optional error message sent when calling Deny()
	* @see $continue
	* @see Deny()
	* @var bool
	*/
	var $joystError = '';

	/**
	* Whether calls to Save(), Create() or SaveCreate() should return the newly created / saved object (i.e. after execution immediately do a Get())
	* @var bool
	*/
	var $returnRow = FALSE;

	/**
	* Enforce type hinting in JSON returns
	* Normally all parameters would be returned as strings even if the DB type is a number
	* e.g. users.userid = "1", "2" etc. If this option is turned on Joyst will force type casting BEFORE the JSON return to ensure users.userid = 1, 2 instead of a string
	* This option is unfortunately necessary for Angular when using input[type=number] boxes which simply refuses to accept string values
	* Enabling this switch automatically runs all returned keys though CastType()
	* @see CastType()
	* @var bool
	*/
	var $enforceTypes = TRUE;


	/**
	* Allow blank create() calls
	* @var bool
	*/
	var $allowBlankCreate = TRUE;

	// Magic functions inc. Constructor {{{
	function __construct() {
		parent::__construct();
		$this->LoadHooks();
	}

	function __call($method, $params) {
		if (preg_match('/^getby(.+)$/i', $method, $matches)) // Make getBy* resolve to GetBy()
			return $this->GetBy(strtolower($matches[1]), $params[0]);
		if ($method == 'construct')
			return;
		trigger_error("Method $method does not exist");
	}
	// }}}
	// Schema handing functions {{{
	/**
	* Load the schema by calling DefineSchema() on the downstream object
	*/
	function LoadSchema() {
		if ($this->schema) // Already loaded
			return;
		$this->schema = $this->DefineSchema();
		$this->ReloadSchema();
	}

	/**
	* Reload the schema object along with all processing thats required
	* This function is usually automatically called by the function that needs it - LoadSchema(), SetSchema() etc.
	* @see LoadSchema
	* @see SetSchema
	*/
	function ReloadSchema() {
		// Sanity checks on schema {{{
		if (!$this->schema)
			trigger_error("No schema returned for model {$this->model} from DefineSchema()") && die();
		if (!isset($this->schema['_id']))
			trigger_error("_id is unset for model {$this->model} via DefineSchema. It must be a string pointer to the ID or the schema structure.") && die();

		if (isset($this->schema['_model'])) {
			$this->model = $this->schema['_model'];
			unset($this->schema['_model']);
		} elseif (!$this->model)
			trigger_error("Model is not set") && die();

		if (isset($this->schema['_table'])) {
			$this->table = $this->schema['_table'];
			unset($this->schema['_table']);
		} elseif (!$this->table)
			trigger_error("Table is not set for model {$this->model}") && die();
		// }}}
		$this->Trigger('setschema', $this->schema);
		// Map _id to whatever its pointing at {{{
		if (isset($this->schema['_id']) && is_string($this->schema['_id'])) {
			if (!isset($this->schema[$this->schema['_id']]))
				trigger_error("_id for model {$this->model} pointing to non-existant field {$this->schema['_id']}") && die();
			$this->schema['_id'] =& $this->schema[$this->schema['_id']];
		}
		// }}}
		// Process the $this->schema array {{{
		$this->_hides = array();
		foreach ($this->schema as $key => $attrib) {
			if (substr($key,0,1) == '_') // Is a meta field - skip
				continue;
			$this->schema[$key]['field'] = $key; // Map 'field' to the ID of each field

			// Deal with types {{{
			if (!isset($this->schema[$key]['type'])) {
				$this->schema[$key]['type'] = 'varchar';
			} else if ($this->schema[$key]['type'] == 'pk') { // All PK fields automatically become readonly
				$this->schema[$key]['allowcreate'] = false;
				$this->schema[$key]['allowsave'] = false;
			}
			// }}}

			// .readonly {{{
			if (isset($this->schema[$key]['readonly']) && $this->schema[$key]['readonly']) { // readonly is an alias for allowsave
				$this->schema[$key]['allowsave'] = false;
				unset($this->schema[$key]['readonly']);
			}
			// }}}

			// .hide {{{
			if (isset($this->schema[$key]['hide']) && $this->schema[$key]['hide']) { // hide is an alias for allowget
				$this->schema[$key]['allowget'] = false;
				unset($this->schema[$key]['hide']);
			}
			// }}}

			// .allowget {{{
			if (isset($this->schema[$key]['allowget']) && !$this->schema[$key]['allowget'])
				$this->_hides[] = $key;
			// }}}
		}
		// }}}
	}

	/**
	* Get an idealized version of the schema
	* This is usually the same as $schema but with some extra stuff added like _model, _table
	* @return array The array structure representing the schema tree
	*/
	function GetSchema() {
		$this->LoadSchema();
		$schema = array(
			'_model' => $this->model,
			'_table' => $this->table,
		);
		$schema = array_merge($schema, $this->schema);
		$schema['_id'] = $this->schema['_id']['field'];
		$this->Trigger('getschema', $schema);
		return $schema;
	}

	/**
	* Force the setting of a schema from an object
	* @param array $schema The schema array to load
	*/
	function SetSchema($schema) {
		$this->schema = $schema;
		$this->ReloadSchema();
	}

	/**
	* Return an input array filtered by fields we are allowed to perform an operation on
	* @param array $array The incomming hash of field values to filter
	* @param string $operation The operation to perform. Can be: where, set, get
	*/
	function FilterFields($array, $operation = 'where') {
		if (!$array)
			return;
		$out = array();
		foreach ($array as $field => $value) {
			if ($operation == 'where' && $this->source == 'internal' && preg_match('/^(.*) (.*)$/', $field, $matches)) { // special CI syntax in key e.g. 'status !=' => 'something' (only for 'where' operations)
				$key = $matches[1];
				$cond = $matches[2];
				$val = $value;
			} elseif ($operation == 'where' && $this->source == 'controller' && is_string($value) && preg_match('/^([\<\>]=?)(.*)$/', $value, $matches)) { // CI syntax in value e.g. '>=value'
				$key = $field;
				$cond = $matches[1];
				$val = $matches[2];
			} elseif ($operation == 'where' && $this->source == 'controller' && is_array($value) && preg_match('/^([\<\>]=?)(.*)$/', $value[0], $matches)) { // CI syntax in value via array (e.g. ['>=value', '<=value'])
				// Accept an array of where conditions - this works around the fact that PHP will always accept the LAST where condition in an URL
				// e.g. ?foo=>1&foo=<10 (foo will == '<10')
				// Use ?foo[]=>1&foo[]=<10 to work around this
				$key = $field;
				$cond = $matches[1];
				$val = $matches[2];

				array_shift($value); // Remove first element - which we've already taken care of
				foreach ($value as $valIndex => $valArray) {
					if (preg_match('/^([\<\>]=?)(.*)$/', $value[$valIndex], $matches))
						$out[isset($matches[1]) && $matches[1] != '=' ? "$key {$matches[1]}" : $key] = $matches[2];
				}
			} else {
				$key = $field;
				$cond = '=';
				$val = $value;
			}

			if (!isset($this->schema[$key])) // Field definition does not exist at all
				continue;

			if ( // Is read-only during a 'set'
				$operation == 'set' &&
				isset($this->schema[$key]['allowset']) &&
				!$this->schema[$key]['allowset']
			)
				continue;

			if ( // Is not filterable by
				$operation == 'where' &&
				isset($this->schema[$key]['allowquery']) &&
				!$this->schema[$key]['allowquery']
			)
				continue;

			// If we got this far its a valid field
			$out[$cond && $cond != '=' ? "$key $cond" : $key] = $val;
		}
		return $out;
	}
	// }}}
	// Hook functions {{{
	function LoadHooks() {
		if (isset($GLOBALS['model_hooks']))
			$GLOBALS['model_hooks']($this);
	}

	function On($event, $function, $method = 'replace') {
		if (isset($this->hooks[$event])) {
			if ($method == 'replace') {
				$this->hooks[$event] = array($function);
			} elseif ($method == 'append') {
				$this->hooks[$event][] = $funciton;
			} elseif ($method == 'prepend') {
				unshift($this->hooks[$event][], $funciton);
			}
		} else
			$this->hooks[$event] = array($function);
	}

	function Off($event) {
		if (isset($this->hooks[$event]))
			unset($this->hooks[$event]);
	}

	function Trigger($event, &$a = null, &$b = null, &$c = null) {
		if (!isset($this->hooks[$event]) || !$this->hooks[$event])
			return;

		foreach ($this->hooks[$event] as $func)
			$func($a, $b, $c);
	}
	// }}}
	// Cache handling functions {{{
	/**
	* Helper function to quickly get whether caching should be enabled for a partiqular type
	* @param string $type The type of operation (e.g. 'get')
	* @return bool Whether caching is enabled for a given type
	*/
	function UseCache($type) {
		return (isset($this->cache[$type]) && $this->cache[$type]);
	}

	/**
	* Get the value of a cache entity
	* @param string $type The operation (e.g. 'get', 'getall')
	* @param mixed $id The ID of the row to cache
	* @return mixed|null The cache contents if any
	*/
	function GetCache($type, $id) {
		if (!isset($this->cache[$type]) || !$this->cache[$type]) // Dont cache this type of call
			return FALSE;
		if (isset($this->_cache[$type][$id]))
			return $this->_cache[$type][$id];
		return FALSE;
	}
	
	/**
	* Set a cache item
	* @param string $type The operation (e.g. 'get', 'getall')
	* @param mixed $id The ID of the row to cache
	* @param mixed|null $value The value to cache (set to null to remove from cache)
	* @return mixed|null The cache contents if any
	*/
	function SetCache($type, $id, $value) {
		if (!isset($this->cache[$type]) || !$this->cache[$type]) // Dont cache this type of call
			return $value;
		if ($value) {
			if (!isset($this->_cache[$type]))
				$this->_cache[$type] = array();
			$this->_cache[$type][$id] = $value;
			return $this->_cache[$type][$id];
		} elseif (isset($this->_cache[$type][$id])) {
			unset($this->_cache[$type][$id]);
			return null;
		}
	}

	/**
	* Clears the cache of a specific item, type or entirely
	* @param string|null $type Either the type of cache item to clear or null (in which case the entire cache is cleared)
	* @param string|null $id Either the ID of the item to clear or null (in which case all cached items for the given $type is cleared)
	*/
	function ClearCache($type = null, $id = null) {
		if (!$type) { // Clear everything
			$this->_cache = array();
		} elseif (!$id) { // Clear on section
			$this->_cache[$type] = array();
		} else { // Clear a specific type/id combination
			$this->SetCache($type, $id, null);
		}
	}
	// }}}

	/**
	* Stop Joyst resolving a query
	* This function will set $this->continue = FALSE and set $this->joystError to the $reason
	* This can be placed in any callback to prevent Joyst from continuing execution
	* @param string $reason An error message
	*/
	function Deny($reason = '$this->Joyst->Deny() called without a reason') {
		$this->continue = FALSE;
		$this->joystError = $reason;
	}

	/**
	* Pass a debugging header along to the client in the X-Debug header
	* This function can take any number of parameters each of which will be safely sanitized into string form
	* It works more or less the same as console.log() in JavaScript
	* @param string|array $message,... Any number of objects or strings to output
	*/
	function Debug() {
		$args = func_get_args();
		if (count($args) == 0) {
			header('X-Debug: Hello World');
		} elseif (count($args) == 1) {
			header('X-Debug: ' . $this->_EscapeHeader($args[0]));
		} else {
			$out = '';
			foreach ($args as $arg) {
				if (is_array($arg) || is_object($arg)) {
					$out .= json_encode($arg) . ' ';
				} else
					$out .= $arg . ' ';
			}
			$out = substr($out, 0, -1);
			header('X-Debug: ' . $this->_EscapeHeader($out));
		}
	}

	/**
	* Returns a sanitized header-safe string
	* @param string $text The text to make safe
	* @return string The sanitized string
	*/
	function _EscapeHeader($text) {
		return preg_replace('/[^a-z0-9\'":#\-_+@\$\^\&\*\(\)\[\]\{\}\., ]+/i', '_' , $text);
	}

	/**
	* Retrieve a single item by its ID
	* Calls the 'get' trigger on the retrieved row
	* @param mixed|null $id The ID (usually an Int) to retrieve the row by
	* @return array The database row
	*/
	function Get($id) {
		$this->continue = TRUE;
		$this->LoadSchema();
		if ($value = $this->GetCache('get', $id))
			return $value;

		$this->ResetQuery(array(
			'method' => 'get',
			'table' => $this->table,
			'where' => array(
				$this->schema['_id']['field'] => $id,
			),
			'limit' => 1,
		));

		$this->db->from($this->query['table']);
		$this->db->where("{$this->table}.{$this->schema['_id']['field']}", $id);
		$this->db->limit(1);
		$row = $this->db->get()->row_array();
		if ($row)
			$this->ApplyRow($row);
		if (!$this->continue)
			return FALSE;

		$this->Trigger('access', $this->query['where']);
		if (!$this->continue)
			return FALSE;

		$this->Trigger('pull', $this->query['where']);
		if (!$this->continue)
			return FALSE;

		return $this->SetCache('get', $id, $row);
	}

	/**
	* Similar to get() but does not fire the row() trigger to further populate a record
	* @param mixed|null $id The ID (usually an Int) to retrieve the row by
	* @return array The database row
	*/
	function GetBasic($id) {
		$this->continue = TRUE;
		$this->LoadSchema();
		if ($value = $this->GetCache('getbasic', $id))
			return $value;

		$this->ResetQuery(array(
			'method' => 'getbasic',
			'table' => $this->table,
			'where' => array(
				$this->schema['_id']['field'] => $id,
			),
			'limit' => 1,
		));

		$this->db->from($this->query['table']);
		$this->db->where("{$this->table}.{$this->schema['_id']['field']}", $id);
		$this->db->limit(1);
		$row = $this->db->get()->row_array();

		$this->Trigger('access', $row);
		if (!$this->continue)
			return FALSE;

		$this->Trigger('pull', $row);
		if (!$this->continue)
			return FALSE;

		return $this->SetCache('getbasic', $id, $row);
	}

	/**
	* Retrieve a single item by a given field
	* This is an assistant function to the magic function that allows 'GetBy$FIELD' type calls
	* e.g. GetBy('email', 'matt@mfdc.biz') OR GetByEmail('matt@mfdc.biz')
	* @param string $param A single field to retrieve data by
	* @param mixed $value The criteria to search by
	* @return array The first matching row that matches the given criteria
	*/
	function GetBy($param, $value) {
		$this->LoadSchema();
		if ($cacheval = $this->GetCache('getby', $cacheid = "$param-$value"))
			return $cacheval;

		$this->ResetQuery(array(
			'method' => 'getby',
			'table' => $this->table,
			'where' => array(
				$param => $value,
			),
			'limit' => 1,
		));

		$this->db->from($this->table);
		$this->db->where($param, $value);
		$this->db->limit(1);
		$row = $this->db->get()->row_array();
		if ($row)
			$this->ApplyRow($row);
		if (!$this->continue)
			return FALSE;

		$this->Trigger('access', $row);
		if (!$this->continue)
			return FALSE;

		$this->Trigger('pull', $row);
		if (!$this->continue)
			return FALSE;

		return $this->SetCache('getby', $cacheid, $row);
	}

	/**
	* Retrieves multiple items filtered by where conditions
	* Calls the 'getall' trigger to apply additional filters
	* Calls the 'get' trigger on each retrieved row
	* @param array $where Additional where conditions to apply
	* @param string $orderby The ordering criteria to use
	* @param int $limit The limit of records to retrieve
	* @param int $offset The offset of records to retrieve
	* @return array All found database rows
	*/
	function GetAll($where = null, $orderby = null, $limit = null, $offset = null) {
		$this->LoadSchema();
		if ($this->UseCache('getall')) {
			$params = func_get_args();
			$cacheid = md5(json_encode($params));

			if ($value = $this->GetCache('getall', $cacheid))
				return $value;
		}

		$this->ResetQuery(array(
			'method' => 'getall',
			'table' => $this->table,
			'where' => $where,
			'orderby' => $orderby,
			'limit' => $limit,
			'offset' => $offset,
		));

		$this->Trigger('access', $where);
		if (!$this->continue)
			return array();

		$this->Trigger('pull', $where);
		if (!$this->continue)
			return array();

		$this->Trigger('getall', $where, $orderby, $limit, $offset);
		if (!$this->continue)
			return array();

		$this->db->from($this->table);

		if ($where = $this->FilterFields($where, 'where'))
			$this->db->where($where);
		if ($orderby)
			$this->db->order_by($orderby);
		if ($limit || $offset)
			$this->db->limit($limit,$offset);

		$out = array();
		foreach ($this->db->get()->result_array() as $row) {
			$this->ApplyRow($row);
			if (!$this->continue)
				return array();
			$out[] = $row;
		}

		$this->Trigger('rows', $out);
		if (!$this->continue)
			return array();

		return isset($cacheid) ? $this->SetCache('getall', $cacheid, $out) : $out;
	}

	/**
	* Shorthand function to run GetAll() and run a callback function on each return
	* @param array $where A GetAll() compatible where condition
	* @param callback $callback Callback to call on each matching item. Callback will take the form `function(&$row)`. If $row is boolean FALSE or the function returns FALSE the return of Each() will be omitted - similar to Map()
	* @return array This function will always return an array, blank if nothing matched or populated if something did in a similar style to Map()
	*/
	function Each($where, $callback) {
		$out = array();
		$rows = $this->GetAll($where);
		if (!$rows)
			return $out;
		foreach ($rows as $row) {
			$return = $callback($row);
			if ($return === false || !$row) // We got (deep-checked) FALSE or row was mangled into nothing - skip
				continue;
			$out[] = $row;
		}
		return $out;
	}

	/**
	* Alias for Each
	* @see Each()
	*/
	function Map($where, $callback) {
		return $this->Each($where, $callback);
	}

	/**
	* Shorthand function to return all the available options for a given field
	* This will only really be useful for [type=enum] as its the only one that should return something useful anyway
	* @param string $field The field to return the available options for
	*/
	function GetOptions($field) {
		$this->LoadSchema();
		if (
			isset($this->schema[$field]) && // A valid field
			isset($this->schema[$field]['options']) // Valid options
		)
			return $this->schema[$field]['options'];
	}

	/**
	* Called on each row after a Get() or GetAll() call to mangle the data provided back to the client
	* This function also applies the 'hide' directive for all rows to remove the outgoing data
	* Calls the 'get' trigger
	* @param array &$row The row to call the 'row' trigger on
	* @see Get()
	* @see GetAll()
	* @see ApplyRows()
	* @return array The mangled database row
	*/
	function ApplyRow(&$row) {
		$this->LoadSchema();
		$this->Trigger('row', $row);
		if (!$this->continue)
			return FALSE;

		if ($this->enforceTypes)
			foreach ($this->schema as $key => $props)
				if (isset($row[$key])) {
					$row[$key] = $this->CastType($props['type'], $row[$key], $row);
					if ($row[$key] === null)
						unset($row[$key]);
				}

		if (!$this->_hides)
			return;
		foreach ($this->_hides as $field)
			unset($row[$field]);
	}

	/**
	* Attempts to automatically convert from a database type into a PHP data type
	* e.g. CastType('int', "123") // returns 123 as an INT type
	* e.g. CastType('string', 123) // returns 123 as a STRING type
	*
	* @param string $type The type to cast to
	* @param mixed $data The data to convert
	* @param array $row Row to operate on if type requires access to its peers (e.g. 'json-import')
	* @return mixed The properly cast data type
	*/
	function CastType($type, $data, &$row = null) {
		switch ($type) {
			case 'int':
			case 'number':
				return (int) $data;
			case 'decimal':
			case 'float':
				return (float) $data;
			case 'string':
			case 'varchar':
			case 'char':
				return (string) $data;
			case 'json':
				return json_decode($data, TRUE);
			case 'json-import':
				$json = json_decode($data);
				if ($json)
					foreach ($json as $key => $val) {
						$row[$key] = $val;
					}
				return null;
			default: // No idea what this is
				return $data;
		}
	}

	/**
	* Converts a data type back into the DB format from the PHP object
	* @see CastType
	* @param string $type The type to cast from
	* @param mixed $data The data to convert
	* @param array $row Row to operate on if type requires access to its peers (e.g. 'json-import')
	* @return mixed The DB compatible data type
	*/
	function UnCastType($type, $data, &$row = null) {
		switch ($type) {
			case 'json':
				return json_encode($data);
			case 'json-import':
				if (!is_array($data))
					$data = array();
				foreach ($row as $key => $val) {
					if (substr($key, 0, 1) == '_') // Skip meta fields
						continue;
					if (!isset($this->schema[$key])) { // This key is unrecognised - import into JSON blob
						$data[$key] = $val;
						unset($row[$key]);
					}
				}
				$data = json_encode($data);
				return $data;
			default: // No idea what this is or we dont care
				return $data;
		}
	}

	/**
	* Convenience function to walk over an array-of-hashes and apply Row() to each member
	* This function can work with hashes as well as arrays so either an array-of-hashes or hash-of-hashes are both fine
	* @param array &$rows An array of hashes where the 'Row' call will be applied to each
	*/
	function ApplyRows(&$rows) {
		foreach($rows as $key => $row) {
			$this->ApplyRow($rows[$key]);
			if (!$this->continue)
				return FALSE;
		}
	}

	/**
	* Similar to GetAll() this function just returns a count of records that would be returned
	* Calls the 'getall' trigger to apply additional filters
	* @see GetAll()
	* @return int The number of records matching the where condition
	*/
	function Count($where = null) {
		$this->LoadSchema();
		if ($this->UseCache('count')) {
			$cacheid = md5(json_encode($where));

			if ($value = $this->GetCache('count', $cacheid))
				return $value;
		}

		$this->ResetQuery(array(
			'method' => 'count',
			'table' => $this->table,
			'where' => $where,
		));

		$this->Trigger('access', $where);
		if (!$this->continue)
			return 0;

		$this->Trigger('pull', $where);
		if (!$this->continue)
			return 0;

		$this->Trigger('getall', $where);
		if (!$this->continue)
			return 0;

		$this->db->select('COUNT(*) AS count');
		$this->db->from($this->table);
		if ($where = $this->FilterFields($where, 'where'))
			$this->db->where($where);
		$row = $this->db->get()->row_array();
		if (!$this->continue)
			return 0;

		return isset($cacheid) ? $this->SetCache('count', $cacheid, $row['count']) : $row['count'];
	}

	/**
	* Wrapper around Save() to test if an ID is specified if not Create() is called instead
	* @param array $data A hash of data to save, if the primary key is omitted Create() is called, if present Save() is called
	* @return null|array If $returnRow is true this function will return the newly created object, if FALSE the ID of the newly created object
	*/
	function SaveCreate($data) {
		if (!$data)
			return;

		if (!is_array($data))
			die('Joyst_Model#SaveCreate()> Data must be a hash');

		$this->LoadSchema();

		if (isset($data[$this->schema['_id']['field']])) { // ID present?
			$id = $data[$this->schema['_id']['field']];
			unset($data[$this->schema['_id']['field']]); // Remove ID from saving data (it will only be removed during filtering anyway as PKs can never be saved)
			return $this->Save($id, $data);
		} else { // ID not present - use create
			return $this->Create($data);
		}
	}

	/**
	* Attempt to create a database record using the provided data
	* Calls the 'create' trigger on the data before it is saved
	* @param array $data A hash of data to attempt to store
	* @return null|array If $returnRow is true this function will return the newly created object, if FALSE the ID of the newly created object
	*/
	function Create($data) {
		if (!$this->allowBlankCreate && !$data)
			return;
		$this->LoadSchema();

		if ($this->enforceTypes)
			foreach ($this->schema as $key => $props)
				if (isset($data[$key]) || $props['type'] == 'json-import')
					$data[$key] = $this->UnCastType($props['type'], isset($data[$key]) ? $data[$key] : null, $data);

		$this->ResetQuery(array(
			'method' => 'create',
			'table' => $this->table,
			'data' => $data,
		));

		$this->Trigger('access', $data);
		if (!$this->continue)
			return FALSE;

		$this->Trigger('push', $data);
		if (!$this->continue)
			return FALSE;

		$this->Trigger('create', $data);
		if (! $data = $this->FilterFields($data, 'set')) // Nothing to save
			return FALSE;
		if (!$this->continue)
			return FALSE;

		$this->db->insert($this->table, $data);
		$id = $this->db->insert_id();

		$this->Trigger('created', $id, $data);
		return $this->returnRow ? $this->Get($id) : $id;
	}

	/**
	* Attempt to save a database record using the provided data
	* Calls the 'save' trigger on the data before it is saved
	* @param mixed|array $id The ID to use to identify the record to change or the full row to save (data will be ignored)
	* @param array $data A hash of data to attempt to store (optional if ID is the full row)
	* @return null|array If $returnRow is true this function will return the newly saved object, if FALSE the array of data saved
	*/
	function Save($id, $data = null) {
		if (!$id)
			return;

		$this->LoadSchema();

		if (is_array($id)) {
			$data = $id;
			if (!isset($data[$this->schema['_id']['field']])) // Incomming data has no ID to address by
				return;
			$id = $data[$this->schema['_id']['field']];
		} else {
			$data[$this->schema['_id']['field']] = $id;
		}

		if (!$data)
			return;

		if ($this->enforceTypes)
			foreach ($this->schema as $key => $props)
				if (isset($data[$key]) || $props['type'] == 'json-import')
					$data[$key] = $this->UnCastType($props['type'], isset($data[$key]) ? $data[$key] : null, $data);

		$this->ResetQuery(array(
			'method' => 'save',
			'table' => $this->table,
			'where' => array(
				$this->schema['_id']['field'] => $id,
			),
			'data' => $data,
		));

		$this->Trigger('access', $data);
		if (!$this->continue)
			return FALSE;

		$this->Trigger('push', $data);
		if (!$this->continue)
			return FALSE;

		unset($data[$this->schema['_id']['field']]); // Remove ID from saving data (it will only be removed during filtering anyway as PKs can never be saved)

		$this->trigger('save', $id, $data);
		if (!$this->continue)
			return FALSE;

		if (! $data = $this->FilterFields($data, 'set')) // Nothing to save
			return FALSE;
		if (!$this->continue)
			return FALSE;

		$this->db->where("{$this->table}.{$this->schema['_id']['field']}", $id);
		$this->db->update($this->table, $data);

		$this->Trigger('saved', $id, $save);
		$this->ClearCache('get', $id); // Wipe the cache so the next get() doesn't return cached data

		return $this->returnRow ? $this->Get($id) : $save;
	}

	/**
	* Delete a single item by its ID
	* Calls the 'delete' trigger on the retrieved row
	* @param mixed|null $id The ID (usually an Int) to retrieve the row by
	* @return bool The success of the delete operation
	*/
	function Delete($id) {
		$this->LoadSchema();

		$data = array($this->schema['_id']['field'] => $id);

		$this->ResetQuery(array(
			'method' => 'delete',
			'table' => $this->table,
			'where' => array(
				$this->schema['_id']['field'] => $id,
			),
		));

		$this->Trigger('access', $data);
		if (!$this->continue)
			return FALSE;

		$this->Trigger('push', $data);
		if (!$this->continue)
			return FALSE;

		$this->Trigger('delete', $id);
		if (!$id)
			return FALSE;
		if (!$this->continue)
			return FALSE;

		$this->db->from($this->table);
		$this->db->where("{$this->table}.{$this->schema['_id']['field']}", $id);
		$this->db->delete();

		$this->Trigger('deleted', $id);
		return TRUE;
	}

	/**
	* Delete a number of records by a complex GetAll() compatible expression
	* Calls the 'deleteall' trigger to apply additional filters
	* This function really just wraps GetAll() and Delete() together
	* @see GetAll()
	* @see Delete()
	* @see Each()
	* @return int The number of records removed successfully
	*/
	function DeleteAll($where = null, $orderby = null) {
		$this->LoadSchema();

		$this->ResetQuery(array(
			'method' => 'deleteall',
			'table' => $this->table,
			'where' => $where,
		));

		$this->Trigger('access', $where);
		if (!$this->continue)
			return FALSE;

		$this->Trigger('pull', $where);
		if (!$this->continue)
			return FALSE;

		$this->Trigger('push', $where);
		if (!$this->continue)
			return FALSE;

		$this->Trigger('deleteall', $where, $orderby);

		if (!$this->continue)
			return FALSE;
		if (!$rows = $this->GetAll($where, $orderby))
			return;

		$success = 0;
		foreach($rows as $row)
			if ($this->Delete($row[$this->schema['_id']['field']]))
				$success++;

		return (int) $success;
	}

	/**
	* Force CI ActiveRecord + Joyst to discard any half formed AR queries
	* @param array $query Optional query to reset Joysts internal query tracker to
	*/
	function ResetQuery($query = null) {
		$this->db->ar_select = array();
		$this->db->ar_distinct = FALSE;
		$this->db->ar_from = array();
		$this->db->ar_join = array();
		$this->db->ar_where = array();
		$this->db->ar_like = array();
		$this->db->ar_groupby = array();
		$this->db->ar_having = array();
		$this->db->ar_keys = array();
		$this->db->ar_limit = FALSE;
		$this->db->ar_offset = FALSE;
		$this->db->ar_order = FALSE;
		$this->db->ar_orderby = array();
		$this->db->ar_set = array();
		$this->db->ar_wherein = array();
		$this->db->ar_aliased_tables = array();
		$this->db->ar_store_array = array();

		$this->joystError = '';
		$this->continue = TRUE;
		$this->query = $query;
	}

	function DebugReponse() {
		$args = func_get_args();
		echo "Joyst_model#Debug():" . print_r($args, 1);
		die();
	}
}

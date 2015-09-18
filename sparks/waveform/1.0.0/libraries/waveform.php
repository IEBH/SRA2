<?php
/**
* Waveform form generator and validator class
* This file should stand alone unless there is any specific requirement for individual helper libraries such as jQuery.
*
* Feel free to use this class any way you wish.
* Even thinking of not properly crediting the author will result in the author killing you with hammers.
*
* @package Waveform
* @version 1.3.0
* @author "Matt Carter" <m@ttcarter.com>
* @link https://github.com/hash-bang/Spark-Waveform
* @license http://opensource.org/licenses/gpl-license.php GNU Public License
*/

// Waveform Constants {{{
// Type constants:
define('WAVEFORM_TYPE_STRING', 0); // Default simple text entry
define('WAVEFORM_TYPE_INT', 1); // Number requirement
define('WAVEFORM_TYPE_FLOAT', 2); // Number requirement with float support
define('WAVEFORM_TYPE_CHOICE', 3); // Restricted choice (i.e. <select> box)
define('WAVEFORM_TYPE_MULTIPLE_CHOICE', 4); // Restricted choice (i.e. <select> box)
define('WAVEFORM_TYPE_TEXT', 5); // Large multi-line text entry
define('WAVEFORM_TYPE_LABEL', 6); // Read-only value (just display it)
define('WAVEFORM_TYPE_LINK', 7); // Similar to Read-only but wrap it in <a> tags as a link
define('WAVEFORM_TYPE_FILE', 8); // File uploads
define('WAVEFORM_TYPE_PASSWORD', 9); // Password (ask twice)
define('WAVEFORM_TYPE_EPOC', 10); // Epoc counter type (date stored as an int)
define('WAVEFORM_TYPE_CHECKBOX', 11); // Yes / no style checkbox
// Type constants (meta):
define('WAVEFORM_TYPE_GROUP', 100); // Meta-field to indicate the start of a group
// }}} Waveform Constants

// Waveform Class {{{
/**
* Form generator and validator class
* @package Waveform
* @author "Matt Carter" <m@ttcarter.com>
*/
class Waveform {
	/**
	* Whether the form is 'fresh' i.e. The user has not yet submitted anything new.
	* This occurs on the first page view of a form
	* @var bool
	*/
	var $fresh;

	/**
	* Simple key => values of the incoming $_POST request
	* This is intended as a simple method to return any Waveform fields that have been passed in post
	* e.g.
	* foreach ($Waveform->keys as $key => val)
	* @var array
	*/
	var $keys;

	/**
	* Field definitions in the form of an assoc array
	* @var array
	*/
	var $_fields;

	/**
	* Convenience array of supplied field values
	* @var array
	*/
	var $Fields;

	/**
	* The currently active field name when cycling over fields to render (used during the ->Form, ->Table macros)
	* @var string
	*/
	var $activefield;

	/**
	* The style to output when using Form()
	* @see SetDefaultStyle()
	* @see Form()
	* @var array
	*/
	var $_style;

	/**
	* Array of all fields that validate
	* @var array
	*/
	var $_ok;

	/**
	* Assoc array of all fields that failed validation
	* Form: field => array(failed validation methods)
	* @var array
	*/
	var $_failed;

	/**
	* Assoc array of other attributes to accept for fields
	* e.g. ->Foo('bar') becomes ->foo = 'bar' for the field if this array contains ('foo' => TRUE)
	* @var array
	*/
	var $_attributes;

	// Constructors & basic defaults {{{
	/**
	* Constructor
	*/
	function __construct() {
		$this->_attributes = array();
		$this->_fields = array();
		$this->_failed = array();
		$this->SetDefaultStyle();
		$this->fresh = TRUE;
		if (file_exists($f = 'system/application/libraries/Waveform.Style.php')) // Load style file if it exists (CI version)
			require(getcwd() . "/" . $f);
	}

	function SetDefaultStyle() {
		$this->_style = array(
			/* Example style
			'element' => array(
				'TAG' => 'input', // The HTML tag to use
				'RENDER' => 1, // Actually output something - 1 is assumed if omitted
				'SKIP' => 0, // Do not render the outer tags of this element but still render its contents (similar to RENDER but this just skips the rendering of the tag BUT STILL renders the child elements) - 0 is assumed if omitted
				'LEADIN' => 'string', // Anything to put BEFORE the tag
				'LEADOUT' => 'string', // Anything to put AFTER the tag
				'PREFIX' => 'string', // Content inside the tag before the tags value
				'SUFFIX' => 'string', // Content to inside the tag after the tags value
				'CONTENT' => 'string', // Content to display when nothing else is present

				'class' => 'whatever', // Anything else is enclosed as a parameter in the tag anyway (this would output <input class="whatever">)
			),
			*/

			// FORM Constructor
			'form' => array(
				'TAG' => 'form',
				'action' => isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '?',
				'method' => 'POST',
				'enctype' => 'multipart/form-data',
			),
			'form_submit' => array(
				'TAG' => 'input',
				'type' => 'submit',
				'value' => 'Continue',
			),

			// TABLE Constructor
			'table' => array( // The layout table used in Table
				'TAG' => 'table',
			),
			'table_row' => array( // A row of label = inputs used in Table
				'TAG' => 'tr',
			),
			'table_row_err' => array( // If there is an issue with this field this style is merged with table_row
			),
			'table_label' => array( // The label area within a table_row
				'TAG' => 'td',
			),
			'table_label_err' => array( // If there is an issue with this field this style is merged with table_label
			),
			'table_input' => array( // The TD of the input element
				'TAG' => 'td',
			),
			'table_input_err' => array( // If there is an issue with this field this style is merged with table_input
			),
			'table_group' => array( // The group meta-field row
				'TAG' => 'tr',
			),
			'table_group_label' => array( // The actual group cell
				'TAG' => 'th',
				'colspan' => 2,
			),
			'table_span' => array(
				'TAG' => 'td',
				'colspan' => 2,
			),

			// ERRS Constructor
			'errs' => array( // Error group
				'TAG' => 'ul',
			),
			'errs_row' => array( // Single error item
				'TAG' => 'li',
			),

			// Individual data type Constructors
			/*
			WAVEFORM_TYPE_INT => array(
				'TAG' => 'input',
				'IMPORT_VALUE' => 1,
				'name' => $field,
				'type' => 'text',
				'size' => 5,
				'value' => $this->_fields[$field]->value,
			),

			WAVEFORM_TYPE_CHOICE => array(
				'TAG' => 'select',
				'IMPORT_CHOICES' => 'WAVEFORM_TYPE_CHOICE_OPTION',
				'name' => $field,
			),

			'WAVEFORM_TYPE_CHOICE_OPTION' => array(
				'TAG' => 'option',
				'IMPORT_VALUE' => 1,
				'IMPORT_
				'IMPORT_CHOICES' => 'WAVEFORM_TYPE_CHOICE_OPTION',
				'name' => $field,
			),
			*/
		);
	}
	//  }}} Constructors & basic defaults

	// Validator functionality {{{
	/**
	* Tests the validation of all or a selected number of fields
	* @param string|array $fields A field spec according to Filter()
	* @return null|array Either null if there was a fault or an array of fields (actually a pointer to $this->Fields)
	*/
	function OK($fields = null) {
		$fields = $this->Filter($this->_fields, $fields);
		if ($this->fresh)
			return null;
		$this->_failed = $this->_ok = array();
		foreach ($fields as $field) {
			if (! $this->_fields[$field]->Check()) {
				$this->_failed[] = $field;
			} else {
				$this->_ok[] = $field;
			}
		}
		if ($this->_failed) {
			return null;
		} else { // Everything was ok
			foreach ($fields as $field)
				$this->_fields[$field]->Accepted();
			return $this->Fields;
		}
	}

	/**
	* Force a field failure with a custom error message
	* @param string $field The field to fail
	* @param string $text The error message to output
	*/
	function Fail($field, $text) {
		$this->_fields[$field]->Fail($text);
		$this->_failed[] = $field;
	}

	/**
	* Return the value of a given field - if no specific field is found all Waveform fields are returned as an array
	* @param string $field The field to return, if no field is specified all are returned as an array
	* @return mixed|array Either the specific field requested or all as an array
	*/
	function Value($field = null) {
		if ($field) {
			return isset($this->_fields[$field]) ? $this->_fields[$field]->value : FALSE;
		} else {
			$out = array();
			foreach ($this->_fields[$field] as $field)
				$out[$field->field] = $field->value;
			return $out;
		}
	}

	/**
	* Alias of Value()
	* @see Value()
	*/
	function Values($field = null) {
		return $this->Value($field);
	}

	/**
	* Return a field record
	* @param string $field The field to return
	* @return WaveFormField The field object found or FALSE if not found
	*/
	function Field($field) {
		return isset($this->_fields[$field]) ? $this->_fields[$field] : FALSE;
	}

	/**
	* Alias of Field()
	* @param string $field The field to return
	* @see Field()
	* @return WaveFormField The field object found or FALSE if not found
	*/
	function Get($field) {
		return $this->Field($field);
	}

	/**
	* Get a hash of field values (if $fields is omitted all field values are returned)
	* DEPRECIATED - Use $waveform->Value() instead
	* @param string|array $fields A field spec according to Filter()
	* @depreciated 1.3.0
	*/
	function GetHash($fields = null) {
		$out = array();
		foreach ($this->Filter($this->_fields, $fields) as $field)
			$out[$field] = $this->_fields[$field]->value;	
		return $out;
	}

	/**
	* Apply a method to a number of fields
	* This functionality is intended as a really lazy way to mass set a number of fields in a one-liner call
	* This function only works on existing fields that have already been delcared
	* e.g.
	* 	$this->waveform->Apply('NotRequired', array('street', 'suburb', 'city', 'state', 'country',  'postcode'));
	*
	* @param string|array $methods Either a single method to apply or an array of methods
	* @param string|array $fields Either a single field or multiple fields to apply the method to
	* @param bool $silent If boolean TRUE no errors will be reported if the field does not exist. If false trigger_error will be called
	*/
	function Apply($methods, $fields = null, $silent = FALSE) {
		foreach ((array) $methods as $method) {
			foreach ($this->Filter($this->_fields, $fields) as $field) {
				if (isset($this->_fields[$field])) {
					$this->_fields[$field]->$method();
				} elseif (!$silent)
					trigger_error("Attempted to call method '$method' via Apply() on non-existant field '$field'", E_USER_WARNING);
			}
		}
	}

	// }}} Validator functionality

	// Field specification {{{
	/**
	* Define a field and its validation parameters
	* @param string $field The field name to allocate. If omitted a random hash will be generated
	*/
	function Define($field = null) {
		if (!$field)
			$field = $this->GenHash();
		$this->_fields[$field] = new WaveformField($this, $field);
		$this->Fields[$field] =& $this->_fields[$field]->value;
		if (isset($_POST[$field])) { // Import value from _POST if it exists
			$this->_fields[$field]->Set($_POST[$field]);
			$this->keys[$field] =& $this->_fields[$field]->value;
			$this->fresh = FALSE; // This implies the user has tried posting before
		}
		return $this->_fields[$field];
	}
	// }}} Field specification

	// Convenience functions {{{
	/**
	* Filter a hash based on an incoming CSV or array
	* This functionality is used by Form(), Table() or Input() to determine which fields to render
	*
	* 1. If $spec is null or empty the entire key set is returned
	* 2. The $spec can be a simple array of keys to use in which case its just a simple filter list
	* 3. The $spec can also be a CSV of keys (all whitespace is ignored). The CSV can also contain the following meta filters:
	*	* 'foo, bar, baz' - Simple key specifiers - output foo, bar and baz keys
	*	* 'foo - baz' OR 'foo to baz' - Range specifiers - output keys foo to baz
	*	* '!foo' OR '-foo' - Negation - remove 'foo' from the output list (useful when combined with something above)
	*	* 'foo' OR '+foo' - Un-negation - Add 'foo' back into the ouput list (useful when combined with something above)
	*	* '*' - All keys (useful with negation to mean 'except for')
	*
	*	NOTES:
	*	* Any of the above can be used in combination e.g. 'foo, foo - baz, !bar' outputs [foo, baz]
	*	* If ONLY negation is used '*' is prepended automaticly e.g. '!bar, !baz' is actually '*, !bar, !baz'
	*
	* @param array $hash The hash to filter
	* @param string|array $spec The specification to filter the hash by
	* @param bool $quiet Raise an error if a field is requested that is not in $hash
	* @return A list of keys that should be processed (i.e. anything matching via $spec)
	*/
	function Filter($hash, $spec = null, $quiet = true) {
		$filters = null;
		if (!$spec) {
			$filters = array('*');
		} elseif (is_string($spec)) {
			$filters = preg_split('/\s*,\s*/', $spec);
		} elseif (is_array($spec)) {
			$filters = $spec;
		} else {
			trigger_error('Unknown data type as $spec passed to $waveform->Filter()');
			return;
		}

		$negated = array(); // Keys to REMOVE after we finish cycling over $spec
		$out = array(); // Candidate keys to add to the output
		foreach ($filters as $filter) {
			$filter = trim($filter);
			if (preg_match('!^\+\s*(.*)$!', $filter, $matches)) { // +foo
				if (isset($hash[$matches[1]])) {
					$out[$matches[1]] = 1;
				} elseif (!$quiet)
					trigger_error("Unknown field '{$matches[1]}'");
			} elseif (preg_match('!^[-|\!]\s*(.*)$!', $filter, $matches)) { // -foo || !foo
				if (isset($hash[$matches[1]])) {
					$negated[$matches[1]] = 1;
				} elseif (!$quiet)
					trigger_error("Unknown field '{$matches[1]}'");
			} elseif (preg_match('!^(.*?)\s*(\-|to)\s*(.*)$!', $filter, $matches)) { // foo - baz || foo to baz
				$catch = 0; // 0 - Not catching, 1 - Catching, 2 - Catching + exit next
				foreach (array_keys($hash) as $key) {
					if ($key == $matches[1]) {
						$catch = 1;
					} elseif ($key == $matches[3]) {
						$catch = 2;
					}
					if ($catch > 0) {
						$out[$key] = 1;
						if ($catch == 2)
							break;
					}
				}
			} elseif ($filter == '*') { // * - add all
				foreach (array_keys($hash) as $key)
					$out[$key] = 1;
			} else { // foo
				if (isset($hash[$filter])) {
					$out[$filter] = 1;
				} elseif (!$quiet)
					trigger_error("Unknown field '$filter'");
			}
		}

		if (!$out && $negated) // All negations - implies add all before negation (i.e. '!foo, !baz' = '*, !foo, !baz')
			foreach (array_keys($hash) as $key)
				$out[$key] = 1;

		// Remove all negated
		foreach (array_keys($negated) as $neg)
			if (isset($out[$neg]))
				unset($out[$neg]);

		return array_keys($out);
	}

	/**
	* Generate a unique hash and check for collisions
	* @param array $existing An array of existing hashes to check when making a new hash. If omitted array_keys($this->_fields) is assumed
	* @param int $length The length of the hash to generate
	* @return string A unique short hash
	*/
	function GenHash($existing = null, $length = 8) {
		$junk = array('0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z');
		while (1) {
			$hash = '';
			for ($x = 0; $x < $length; $x++)
				$hash .= $junk[mt_rand(0, count($junk)-1)];

			if ($existing === null)
				$existing = $this->_fields;
			if (!$existing || !isset($existing[$hash])) // If we dont care about existing hashes OR this hash is unique - exit the loop
				break;
		}
		return $hash;
	}

	/**
	* Specifies a grouping of fields
	* This is useful for particularly long forms
	* @param string $title The title of the group
	*/
	function Group($title) {
		$this->Define($this->GenHash())
			->Type('group')
			->Title($title)
			->NotRequired($title);
	}

	/**
	* Set the value of a single field or assoc array of fields
	* The default behaviour when setting arrays is to only replace the existing value if the existing value is null
	* e.g.
	* // Sets name = 'John Smith'
	* $Waveform->Set('name', 'John Smith')
	*
	* // Sets name = 'John Smith' & age = 21
	* $Waveform->Set(array(
	* 	'name' => 'John Smith',
	*	'age' => 21,
	* ));
	* 
	* // Sets name = 'John Smith' even if name is specified in the last $_POST
	* $Waveform->Set(array(
	* 	'name' => 'John Smith',
	* ), TRUE);
	*
	* @param array|string $field Either the single field to set or the associated array of fields
	* @param mixed $value Optional value to specify if setting only one field. If $field is an array and this is TRUE values will be forcably set even if they are not null
	*/
	function Set($field, $value = null) {
		if (is_array($field)) {
			foreach ($field as $key => $val)
				if (isset($this->_fields[$key]) && ($this->_fields[$key]->value === null || $value) )
					$this->_fields[$key]->value = $val;
		} elseif (isset($this->_fields[$field])) {
			$this->_fields[$field]->value = $value;
		}
	}

	/**
	* Set a global style type
	* e.g.
	*  $this->Waveform->Style('table', 'class', 'border table-big');
	*  $this->Waveform->Style('table', array('class' => 'border table-big'));
	*
	* Inteligence applied:
	* * If unspecified the TAG will be carried from the previous style
	*
	* @param string $style The name of the style element to set
	* @param array|string $attribs Either an array of attributes to set or the name of the single attribute to use with $value
	* @param string|int $value If $attribs is a single string value set that style element to this specified value
	*/
	function Style($style, $attribs, $value = null) {
		if (!isset($this->_style[$style])) // Never seen this style before - define a stub
			$this->_style[$style] = array();
		if (is_array($attribs)) { // Multiple set array
			if (!isset($attribs['TAG']) && isset($this->_style[$style]['TAG'])) // Dont let the new data overwrite the 'TAG' meta property
				$attribs['TAG'] = $this->_style[$style]['TAG'];
			$this->_style[$style] = $attribs;
		} else { // Single set key => val
			$this->_style[$style][$attribs] = $value;
		}
	}

	/**
	* Enable a custom attribute
	* e.g.
	* 	$Waveform->RegisterAttribute('foo')
	*	# Can now be set with:
	*	$Waveform->Foo('value');
	*
	* @param string $attribute The attribute to register
	* @param mixed $default The default value if not specified on each field
	*/
	function RegisterAttribute($attribute, $default = null) {
		$this->_attributes[strtolower($attribute)] = array(
			'enabled' => 1,
			'default' => $default,
		);
	}

	/**
	* Converts an incoming string back into an epoc value
	* This function can be thought as the opposit of the PHP Date() function
	* @param string $format The format as supported by Date()
	* @param string $string The string to convert back to an Epoc
	* @return int The converted Epoc or boolean FALSE
	* @see Date()
	* NOTE: This function uses MCTime's internal Date function pasted here in its entirety
	*/
	function UnDate($format, $string) {
		$translate = array( // Anything thats ===0 in the list below is currently unsupported
			'S' => '(st|nd|rd|th)',
			'L' => '(0|1)',
			'a' => '(am|pm)',
			'A' => '(am|pm)',
			'M' => '([a-z]{3})',
			'F' => '([a-z]{3})',
			// The below date() functions are not supported by McTime yet
			'D' => 0,
			'l' => 0,
			'N' => 0,
			'w' => 0,
			'z' => 0,
			'W' => 0,
			'B' => 0,
			'u' => 0,
			'e' => 0,
			'I' => 0,
			'O' => 0,
			'P' => 0,
			'T' => 0,
			'Z' => 0,
			'c' => 0,
			'r' => 0,
			'U' => '([0-9]+)',
			'y' => '([0-9]{4}|[0-9]{3}|[0-9]{2})', // Years are oftain mistaken as either Y or y
			'Y' => '([0-9]{4}|[0-9]{3}|[0-9]{2})', // Years are oftain mistaken as either Y or y
		);
		foreach (array('d','j','m','n','t','g','G','h','H','i','s') as $tone2) // Standard 2 number translators
			$translate[$tone2] = '([0-9]{1,2})';
		foreach (array('o') as $tone4) // Standard 4 number translators
			$translate[$tone4] = '([0-9]{4})';
		$matchorder = array();
		$matchexp = '';
		$skipnext = 0;
		for ($i = 0; $i < strlen($format); $i++) { // Figure out the format (and load it into the $matchexp with $matchorder as the lookup table)
			if ($skipnext) { // Escape this char?
				$skipnext = 0;
			} elseif ( ($char = substr($format,$i,1)) == '\\') {
				$skipnext = 1;
			} else { // Actually process this char
				if (isset($translate[$char])) {
					if ($translate[$char] === 0)
						die("McTime->getstamp('$format','$string') - I understand what '$char' means but it is currently not supported by this version of McTime. Poke MC for future inclusion\n");
					$matchexp .= $translate[$char];
					$matchorder[] = $char;
				} else
					$matchexp .= preg_quote($char,'/');
			}
		}
		if (!preg_match("/$matchexp/i",$string,$matches))
			return false;

		$months_short = array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');
		$months_long = array('January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');

		$mktime = array('h' => 0, 'i' => 0, 's' => 0, 'm' => 0, 'd' => 0, 'Y' => 0, 'ante' => 0);
		for ($i = 1; $i < count($matches); $i++) {
			switch ($matchorder[$i-1]) {
				case 'd':
				case 'j':
					$mktime['d'] = $matches[$i];
					break;
				case 'M':
					$mktime['m'] = array_search($matches[$i], $months_short) + 1;
					break;
				case 'F':
					$mktime['m'] = array_search($matches[$i], $months_long) + 1;
					break;
				case 'm':
				case 'n':
					$mktime['m'] = $matches[$i];
					break;
				case 'o':
				case 'y':
				case 'Y':
					if ($matches[$i] >= 100)
						$mktime['Y'] = $matches[$i];
					else
						$mktime['Y'] = (int) $matches[$i] + ($matches[$i] < 50 ? 2000 : 1900);
					break;
				case 'A':
				case 'a':
					$mktime['ante'] = (strtolower(substr($matches[$i],0,1)) == 'p');
					break;
				case 'g':
				case 'h':
					$mktime['h'] = $matches[$i] + ($mktime['ante'] ? 12 : 0);
					break;
				case 'H':
				case 'G':
					$mktime['h'] = $matches[$i];
					break;
				case 'i':
					$mktime['i'] = $matches[$i];
					break;
				case 's':
					$mktime['s'] = $matches[$i];
					break;
				case 'U':
					$computed = $matches[$i];
					break;
			}
		}
		if (!isset($computed) || !$computed)
			$computed = mktime($mktime['h'],$mktime['i'],$mktime['s'],$mktime['m'],$mktime['d'],$mktime['Y']);
		return $computed;
	}

	// }}} Convenience functions

	// HTML convenience functionality {{{
	/**
	* Output the HTML required to accept a fields input
	* @param string $field The single field name the HTML is to be generated for
	* @param array $params Additional HTML params to ouput inline. Css can be specified as a sub array (e.g. 'style' => array('text-size' => '10pt'))
	* @return The HTML to accept this field
	*/
	function Input($field, $params = array()) {
		if (!isset($this->_fields[$field]))
			return 'NOT-SPECIFIED';
		if (isset($this->_style[$this->_fields[$field]->type])) // Global Style defined for this type
			$params = array_merge($params, $this->_style[$this->_fields[$field]->type]);
		if (isset($this->_fields[$field]->_style[$this->_fields[$field]->type])) // Local style defined for this type
			$params = array_merge($params, $this->_fields[$field]->_style[$this->_fields[$field]->type]);

		$content = null;
		switch ($this->_fields[$field]->type) {
			case WAVEFORM_TYPE_INT:
			case WAVEFORM_TYPE_FLOAT:
				$defaults = array(
					'name' => $field,
					'type' => 'number',
					'size' => 5,
					'value' => $this->_fields[$field]->value,
				);
				if ($this->_fields[$field]->type == WAVEFORM_TYPE_FLOAT)
					$defaults['step'] = 'any'; // Chrome throws a validation error if this isn't set for floats
				$element = 'input';
				$params = array_merge($defaults, $params);
				break;
			case WAVEFORM_TYPE_CHOICE:
				$element = 'select';
				$params = array_merge(array(
					'name' => $field,
				), $params);
				$content = '';
				foreach ($this->_fields[$field]->choices as $key => $val)
					$content .= "<option value=\"$key\"" . ($this->_fields[$field]->value == $key ? ' selected="selected">' : '>') . "$val</option>";
				break;
			case WAVEFORM_TYPE_MULTIPLE_CHOICE:
				$element = 'select';
				$params = array_merge(array(
					'name' => $field . '[]',
					'multiple' => 'multiple',
				), $params);
				$content = '';
				foreach ($this->_fields[$field]->choices as $key => $val)
					$content .= "<option value=\"$key\"" . (in_array($key, $this->_fields[$field]->value) ? ' selected="selected">' : '>') . "$val</option>";
				break;
			case WAVEFORM_TYPE_TEXT:
				$element = 'textarea';
				$content = $this->_fields[$field]->value;
				$params = array_merge(array(
					'name' => $field,
				), $params);
				break;
			case WAVEFORM_TYPE_LABEL:
				$element = 'span';
				$content = $this->_fields[$field]->value;
				break;
			case WAVEFORM_TYPE_LINK:
				$element = 'a';
				$params = array_merge(array(
					'href' => $this->_fields[$field]->value,
				), $params);
				$content = $this->_fields[$field]->value;
				break;
			case WAVEFORM_TYPE_GROUP:
				$element = 'div';
				$content = $this->_fields[$field]->title;
				break;
			case WAVEFORM_TYPE_FILE:
				$element = 'input';
				$params = array_merge(array(
					'name' => $field,
					'type' => 'file',
				), $params);
				break;
			case WAVEFORM_TYPE_PASSWORD:
				$element = 'input';
				$params = array_merge(array(
					'name' => $field,
					'type' => 'password',
					'value' => $this->_fields[$field]->value,
				), $params);
				break;
			case WAVEFORM_TYPE_EPOC:
				$element = 'input';
				$params = array_merge(array(
					'name' => $field,
					'class' => 'datefield',
					'type' => 'date',
					'value' => $this->_fields[$field]->value === null ? '' : date($this->_fields[$field]->format, $this->_fields[$field]->value),
				), $params);
				break;
			case WAVEFORM_TYPE_CHECKBOX:
				$element = 'input';
				$params = array_merge(array(
					'name' => $field,
					'type' => 'checkbox',
				), $params);
				if ($this->_fields[$field]->value)
					$params['checked'] = 'checked';
				break;
			case WAVEFORM_TYPE_STRING:
			default: // Fall though from _STRING
				$element = 'input';
				$params = array_merge(array(
					'name' => $field,
					'type' => 'text',
					'value' => $this->_fields[$field]->value,
				), $params);
				break;
		}

		if (!isset($params['LEADOUT']))
			$params['LEADOUT'] = '';
		foreach ($this->_fields[$field]->subfields as $k => $props)
			$params['LEADOUT'] .= (isset($props['PREFIX']) ? $props['PREFIX'] : null)
				. $this->Input($k)
				.  (isset($props['SUFFIX']) ? $props['SUFFIX'] : null);

		return $this->_ComposeElement($element, $params, $content);
	}

	/**
	* Returns the (usually text but COULD be HTML) title of a field
	* @param string $field The field to return the HTML title of
	*/
	function Label($field) {
		if (!isset($this->_fields[$field]))
			return 'NOT-SPECIFIED';
		return $this->_fields[$field]->title;
	}

	/**
	* Output an entire form
	* @param string $action The action of where to submit the form. If omitted the value in the _style is used
	* @param string|array $fields A field spec according to Filter()
	* @see Filter()
	* @return string The HTML of the completed form
	*/
	function Form($action = null, $fields = null) {
		if ($action)
			$this->_style['form']['action'] = $action;
		$out = '';
		if (!$this->fresh)
			$out .= $this->Errs();
		$out .= $this->_Compose('form', $this->Table($fields) . $this->_Compose('form_submit'));
		return $out;
	}

	/**
	* Output a set of labels and inputs
	* @param string|array $fields A field spec according to Filter()
	* @param array $style The style to output. See SetDefaultStyle() for information. If null this is copied from _style.
	* @return The HTML of the form
	*/
	function Table($fields = null) {
		$fields = $this->Filter($this->_fields, $fields);
		$table = '';
		$fieldno = 0;
		while ($fieldno < count($fields)) {
			$this->activefield = $fields[$fieldno];
			if (!$this->activefield)
				break;
			if (!$this->_fields[$this->activefield]->show) {
				$fieldno++;
				continue;
			}

			if ($this->_fields[$this->activefield]->type == WAVEFORM_TYPE_GROUP) { // Special drawing case for groups
				$row = $this->_Compose('table_group', $this->_Compose('table_group_label', $this->Input($this->activefield)));
			} elseif ($this->_fields[$this->activefield]->span) { // Special drawing case for span items
				$row = $this->_Compose('table_span', $this->Input($this->activefield));
			} else { // Regular key => val type fields
				$row = $this->_Compose($this->_fields[$this->activefield]->errors ? array('table_label', 'table_label_err') : 'table_label', $this->Label($this->activefield));
				$row .= $this->_Compose($this->_fields[$this->activefield]->errors ? array('table_input', 'table_input_err') : 'table_input', $this->Input($this->activefield));
			}
			$table .= $this->_Compose($this->_fields[$this->activefield]->errors ? array('table_row', 'table_row_err') : 'table_row', $row);
			$fieldno++;
		}
		return $this->_Compose('table', $table);
	}

	/**
	* Output any errors found
	*/
	function Errs() {
		$errs = '';
		foreach ($this->_failed as $field)
			foreach ($this->_fields[$field]->errors as $message)
				$errs .= $this->_Compose('errs_row', $message);
		return $this->_Compose('errs', $errs);
	}

	/**
	* Applies a style object to a given stream and returns the output
	* @param string|array $style Either a single style to apply which pretains to a _style key or an array of styles
	* @param string $content Optional content within the tags
	*/
	function _Compose($style, $content = null) {
		$locals =array(); // Local variables provided when running on eval'd strings (e.g. LEADIN, LEADOUT)
		$locals['waveform'] =& $this;
		if ($this->activefield) { // Drawing a field
			$locals['field'] =& $this->_fields[$this->activefield];
			$locals['errs'] = implode(', ', $this->_fields[$this->activefield]->errors); // Local errors as CSV
		}

		$attribs = array();
		foreach ((array) $style as $s) {
			if (isset($this->_style[$s])) // Inherit styles from global
				$attribs = array_merge($attribs, $this->_style[$s]);
			if (isset($this->_fields[$this->activefield]->_style[$s])) // Inherit styles from local fields
				$attribs = array_merge($attribs, $this->_fields[$this->activefield]->_style[$s]);
		}

		if (isset($attribs['SKIP']) && $attribs['SKIP']) // Dont render this parent - but render the children
			return $content;
		$element = isset($attribs['TAG']) ? $attribs['TAG'] : $style;
		if (!$element || (isset($attribs['RENDER']) && !$attribs['RENDER']))
			return FALSE;
		$out = (isset($attribs['LEADIN']) ? $this->_EvalString($attribs['LEADIN'], $locals) : '') . "<$element";
		foreach ($attribs as $key => $val)
			if (is_array($val)) { // Sub-array, Possibly dealing with a style
				$out .= " $key=\"";
				foreach ($val as $csskey => $cssval)
					$out .= "$csskey: $cssval;";
				$out = substr($out, 0, -1); // Chomp last useless ';'
				$out .= '"';
			} elseif (!preg_match('/^[A-Z]+/', $key)) // Not a meta string like LEADOUT, LEADIN
				$out .= " $key=\"$val\"";
		if (is_string($content) || isset($attribs['CONTENT']) ||  in_array($element, array('textarea'))) { // Either has content or one of those elements that should never be closed early
			$out .= ">"
				. (isset($attribs['PREFIX']) ? $this->_EvalString($attribs['PREFIX'], $locals) : '')
				. (isset($attribs['CONTENT']) ? $attribs['CONTENT'] : $content)
				. (isset($attribs['SUFFIX']) ? $this->_EvalString($attribs['SUFFIX'], $locals) : '')
				. "</$element>";
		} else
			$out .= "/>";
		return $out . (isset($attribs['LEADOUT']) ? $this->_EvalString($attribs['LEADOUT'], $locals) : '');
	}

	/**
	* Returns a version of a string as if it were given in double speach marks
	* e.g. _EvalString("Hello {$this->field}") becomes "Hello name" (if $this->name is 'name')
	* @param string $text The text to process
	* @param array $locals Local variables to provide to the eval'd string
	* @return string The result of the processed string
	*/
	function _EvalString($text, $locals = null) {
		if ($locals)
			extract($locals);
		return eval("return \"" . strtr($text, array('"' => '\\"')) . "\";"); // Vomit indusing hack to Replace " with \" in eval string
	}

	/**
	* Generates a HTML element based on supplied attributes and content
	* @param string $element The HTML element to generate
	* @param array $attribs The attributes of the element
	* @param string|bool $content Any inner HTML content to be output. If boolean true the element is not closed
	* @return string The HTML of a generated element
	*/
	function _ComposeElement($element, $attribs, $content = null) {
		if (!$element || (isset($attribs['RENDER']) && !$attribs['RENDER']))
			return FALSE;
		$out = (isset($attribs['LEADIN']) ? $attribs['LEADIN'] : '');
		$out .= "<$element";
		foreach ($attribs as $key => $val)
			if (is_array($val)) { // Possibly dealing with a style
				$out .= " $key=\"";
				foreach ($val as $csskey => $cssval)
					$out .= "$csskey: $cssval;";
				$out = substr($out, 0, -1); // Chomp last useless ';'
				$out .= '"';
			} elseif (!in_array($key, array('PREFIX', 'SUFFIX', 'LEADIN', 'LEADOUT'))) // Ignore meta directives
				$out .= " $key=\"$val\"";
		if (is_string($content) || in_array($element, array('textarea'))) { // Either has content or one of those elements that should never be closed early
			$out .= '>'
			. (isset($attribs['PREFIX']) ? $attribs['PREFIX'] : '')
			. $content
			. (isset($attribs['SUFFIX']) ? $attribs['SUFFIX'] : '')
			. "</$element>";
		} elseif ($content === null) {
			$out .= "/>";
		} elseif ($content === TRUE)
			$out .= ">";
		$out .= (isset($attribs['LEADOUT']) ? $attribs['LEADOUT'] : '');
		return $out;
	}
	// }}} HTML convenience functionality
}
// }}} Waveform Class

// WaveformField Class {{{
/**
* Individual field class
* @package Waveform
* @author "Matt Carter" <m@ttcarter.com>
*/
class WaveformField {
	/**
	* Parent Waveform object
	* @var object
	*/
	var $parent;

	/**
	* The name of this field
	* @var string
	*/
	var $field;

	/**
	* The human title of this field
	* @var string
	*/
	var $title;

	/**
	* The current value of this field
	* @var string
	*/
	var $value;

	/**
	* The type of this field
	* @var const
	*/
	var $type;

	/**
	* Custom style rules which apply only to this field
	* @var array
	*/
	var $_style;

	/**
	* Errors returned during the last validation run
	* @var array
	*/
	var $errors;

	/**
	* Include this field in the output HTML
	* @var bool
	*/
	var $show;

	/**
	* A list of other fields that should be rendered along side this one
	* This is typically populated by NextTo()
	* @var array
	* @see NextTo()
	*/
	var $subfields;

	/**
	* Do not render the title element when using the Table() helper
	* @var bool
	*/
	var $span;

	/**
	* Whether not to clone this class (internal function used in passwords to double up the field)
	* @var bool
	*/
	var $_dontclone;

	/**
	* The various validation functions to use
	* form: array('function', params...)
	* @var array
	*/
	var $_validators;

	/**
	* Pointer to the active validator
	* @var int
	*/
	var $_activevalidator;

	// Constructors and magic-methods {{{
	function __construct($parent, $field) {
		$this->parent = $parent;
		$this->field = $field;
		$this->type = WAVEFORM_TYPE_STRING;
		$this->title = ucwords(preg_replace('/[^a-z0-9]+/', ' ', $field));
		$this->errors = array();
		$this->value = null;
		$this->_style = array();
		$this->show = 1;
		$this->subfields = array();
		$this->span = FALSE;
		$this->_validators = array(
			array('required'), // Assume 'Required' by default
		);
		foreach ($this->parent->_attributes as $name => $attrib) // Populate all custom attribute default values
			$this->$name = $attrib['default'];
	}

	function __call($name, $params = null) {
		$name = strtolower($name);
		if ($name == 'default') { // Annoying work-around for PHP's reserved words
			return $this->Defaults($params[0]);
		} elseif ($this->IsValidator($name)) {
			$this->Validate($name, $params);
		} elseif (isset($this->parent->_attributes[$name]) && $this->parent->_attributes[$name]['enabled']) { // Accept unknown callbacks as attribute sets. e.g. 'Tip' if boolean TRUE of Parent->_attributes['tip']
			if (count($params) == 1) { // Assume single variable set e.g. ->Tip('Hello world') should not be an array
				$this->$name = $params[0];
			} elseif (count($params) == 0) { // Assume setting variable to true if no parameter specified e.g. ->EnableWidget() is same as ->EnableWidget(1)
				$this->$name = TRUE;
			} else { // Save everything else in its raw form e.g. ->Foo(1,2,3) => array(1,2,3)
				$this->$name = $param;
			}
		} else {
			trigger_error("Attempted to call non-existant function '$name' within Waveform field '{$this->field}'. Call Waveform->RegisterAttribute('$name') if you wish to use ->$name as an attribute setter.", E_USER_WARNING);
		}
		return $this;
	}
	// }}} Constructors and magic-methods

	// Validation functionality {{{
	/**
	* Pass the active validation stage
	*/
	function Pass() {
		return TRUE;
	}

	/**
	* Fail the active validation stage
	* e.g. $this->Fail('%s must be at least 10 characters')
	* @param string $message The message to return. The field title is prepended to this string. The funciton is run though sprintf with the field name
	*/
	function Fail($message) {
		$this->errors[] = sprintf($message, $this->title);
		return FALSE;
	}

	/**
	* Returns if the supplied name is a validator that can be used
	* @param string $name The name of the validator to check the presence of
	* @return bool Boolean TRUE if the validator can be used
	*/
	function IsValidator($name) {
		return (
			method_exists($this, "Apply$name")
			|| method_exists($this, "Check$name")
			|| method_exists($this, "Accept$name")
		);
	}

	/**
	* Setup a validator to a field
	* e.g. $Waveform->Define('field')->Validate('min', 10);
	* @param string $name The name of the field to check. Valid prefixes include '!' and 'Not'
	* @param mixed $params,... Optional parameter values for the validation.
	*/
	function Validate($name, $params = array()) {
		if (!is_array($params))
			$params = array($params);
		if (method_exists($this, $func = "Apply$name") && !call_user_func_array(array($this, $func), (array) $params)) // Check that Apply<validator> wants us to continue
			return FALSE;
		if (method_exists($this, $func = "Check$name") || method_exists($this, $func = "Accept$name")) { // Only append to stack if we will need it later
			array_unshift($params, $name);
			$this->_validators[] = $params;
		} else {
			echo "VALIDATOR NOT FOUND [$func]"; // FIXME
		}
	}

	/**
	* Remove an existing validation method
	* @param string $name The name of the validator to scrap
	* @param int $limit How many of these to remove. If 0 all are removed, 1 just removes the first one found and so on
	* @return int The number of matching validators that were removed
	*/
	function RemoveValidator($name, $limit = 0) {
		$removed = 0;
		$i = 0;
		while ($i < count($this->_validators))
			if ($this->_validators[$i][0] == $name) { // Matches
				array_splice($this->_validators, $i, 1);
				if (++$removed > $limit && $limit > 0)
					return $removed;
			} else {
				$i++;
			}
		return $removed;
	}

	/**
	* Run all applied validators on this field and return the 'master' pass or fail decision
	*/
	function Check() {
		$pass = TRUE;
		$this->errors = array();
		foreach ($this->_validators as $offset => $validator) {
			$this->_activevalidator = $offset;
			$func = 'Check' . array_shift($validator);
			if (method_exists($this, $func) && ! call_user_func_array(array($this, $func), $validator))
				$pass = FALSE;
		}
		if ($this->errors) // Fail if there are already errors in this fields buffer - these are probably manually specified
			return FALSE;
		return $pass;
	}

	/**
	* All tests passed at the parent level. Do any final processing
	*/
	function Accepted() {
		foreach ($this->_validators as $offset => $validator) {
			$this->_activevalidator = $offset;
			$func = 'Accept' . array_shift($validator);
			if (method_exists($this, $func))
				call_user_func_array(array($this, $func), $validator);
		}
	}
	// }}} Validation functionality

	// Convenience functions {{{
	/**
	* Set this field to a given value
	* @param mixed $value The value to set this field to
	*/
	function Set($value) {
		if ($this->type == WAVEFORM_TYPE_MULTIPLE_CHOICE && !is_array($value)) {
			$this->value = array($value);
		} else	
			$this->value = $value;
		return $this;
	}

	/**
	* Set the title of the current field
	* @param string $title The new title to apply
	*/
	function Title($title) {
		$this->title = $title;
		return $this;
	}

	/**
	* Do not render the title of the field when using the Table() helper
	* This effectively makes an input element span both the title and input rows (using up two horizontal spaces in most cases)
	* Its ideally used for textareas or other large input types that need the whole row to display
	* @param bool $enabled Whether to span the field
	*/
	function Span($enabled = TRUE) {
		$this->span = $enabled;
		return $this;
	}

	/**
	* Set this fields type based on a number of common strings
	* This function is intended to be as tolerant as possible of field types - it will accept a few known synonyms for WAVEFORM_TYPE_* varients
	* @param string $type The type to set this field as
	*/
	function Type($type) {
		if (is_int($type)) { // If we are passed an INT blindly trust that its right
			$this->type = $type;
			return $this;
		}
		foreach(array(
			'string|normal' => WAVEFORM_TYPE_STRING,
			'int|integer|number' => WAVEFORM_TYPE_INT,
			'float|decimal' => WAVEFORM_TYPE_FLOAT,
			'choice|select' => WAVEFORM_TYPE_CHOICE,
			'multiple.choice|multiple.select' => WAVEFORM_TYPE_MULTIPLE_CHOICE,
			'text|textarea|blob' => WAVEFORM_TYPE_TEXT,
			'label|readonly|read.only' => WAVEFORM_TYPE_LABEL,
			'file|upload' => WAVEFORM_TYPE_FILE,
			'password|pass' => WAVEFORM_TYPE_PASSWORD,
			'epoc|time|date|datetime|date.time' => WAVEFORM_TYPE_EPOC,
			'checkbox|check|bool|boolean' => WAVEFORM_TYPE_CHECKBOX,
			'group' => WAVEFORM_TYPE_GROUP,
		) as $re => $const)
			if (preg_match("/^$re$/i", $type)) {
				$this->type = $const;
				return $this;
			}
		trigger_error("Unknown field type '$type' (type: " . gettype($type) . ") on field '{$this->field}'");	
		return $this;
	}

	/**
	* Set a style type for this specific field
	*
	* This style has two forms. The first is where a sub-element is specified
	* e.g.
	*     $field->Style('table', 'class', 'border table-big');
	*     $field->Style('table', array('class' => 'border table-big'));
	*
	* And the second is where the first parameter is ASSUMED to refer to the input box the user enters data into
	* e.g.
	*     $field->Style('id', 'my_widget');
	*     $field->Style('class', 'big title');
	*
	* Thus these two methods are functionally the same:
	*     $field->Style(WAVEFORM_TYPE_STRING, 'class', 'border');
	*     $field->Style('class', 'border');
	*
	* Addtional inteligence applied:
	* * If unspecified the TAG will be carried from the previous style
	*
	* @param array|string $attribs Either an array of attributes to set or the name of the single attribute to use with $value
	* @param mixed $value If $attribs is a single string value set that style element to this specified value
	*/
	function Style($element, $attribs, $value = null) {
		if ($element && is_array($attribs)) { // First form - Set the style of an element
			if (!isset($attribs['TAG']) && isset($this->_style[$element]['TAG']))
				$attribs['TAG'] = $this->_style[$element]['TAG'];
			$this->_style[$element] = $attribs;
		} elseif ($element && $attribs && $value) { // First form - Set the style of an element as a simple set
			$this->_style[$element][$attribs] = $value;
		} elseif ($element && $attribs) { // Second form - implied input area
			$this->_style[$this->type][$element] = $attribs;
		}
		return $this;
	}

	/**
	* Place a field next to another
	* This is usually done when trying to align fields horizontally
	* In addition to setting the active element as a sub-element this function also calls Show(0) to hide this field on the subsequent render
	* e.g.
	* 	$this->waveform->Define('first_name');
	*	$this->waveform->Define('last_name')->NextTo('first_name');
	*
	* @param string $field The parent field this field is to be aligned with
	* @param string $parameters Any parameters to be included in the alignment (e.g. PREFIX, SUFFIX can be set to control the spacing between this and its parent)
	*/
	function NextTo($field, $parameters = array()) {
		$this->parent->_fields[$field]->subfields[$this->field] = $parameters;
		return $this->Show(0);
	}

	/**
	* Convenience function to show or hide an element from rendering
	* NOTE: This does not stop Waveform from processing the input. For that you must delete the field from the _fields array
	* @param bool $shown Whether the element should be rendered
	*/
	function Show($shown = 1) {
		$this->show = $shown;
		return $this;
	}

	/**
	* Convenience function which is the opposit of Show()
	*/
	function Hide() {
		return $this->Show(0);
	}

	/**
	* Shorthand function to define a string
	*/
	function String() {
		$this->type = WAVEFORM_TYPE_STRING;
		return $this;
	}

	/**
	* Shorthand function to define an integer
	*/
	function Int() {
		$this->type = WAVEFORM_TYPE_INT;
		return $this;
	}

	/**
	* Shorthand function to define a float
	*/
	function Float() {
		$this->type = WAVEFORM_TYPE_FLOAT;
		return $this;
	}

	/**
	* Convenience function for quickly setting up a number of restricted choices.
	* In HTML this is usually represented by a '<select>' box
	*
	* If $key or $value is specified for an array of assoc arrays the specified sub keys are extracted
	* e.g. If given array( array('name' => 'John', 'uid' => 100), array('name' => 'Luke', 'uid' => 101) )
	* and $key = 'uid', $val = 'name' the following choice array will be used:
	* array(100 => John, 101 => Luke)
	*
	* If $key === boolean false then the incoming array is copied into the keys of the array
	* This is particularly usefull if you want the value returned rather than the index offset
	* e.g. array('one', 'two', 'three') becomes array('one' => 'one', 'two' => 'two', 'three' => 'three')
	*
	* @param array $choices The choices to restrict to. The key is the value returned (If no items are given only the type of the input is set)
	* @param string|boolean $key Optional key to extract (used to specify what subkey of an array of assocs should be used as the key
	* @param string $value Optional value to extract (see $key)
	*/
	function Choice($choices = null, $key = null, $value = null) {
		$this->type = WAVEFORM_TYPE_CHOICE;
		if ($key && $value) { // Extract $key => $value sequence
			$this->choices = array();
			foreach ($choices as $choice)
				$this->choices[$choice[$key]] = $choice[$value];
		} elseif ($key === FALSE) { // Use values as keys
			$this->choices = array_combine($choices, $choices);
		} else
			$this->choices = $choices;
		return $this;
	}

	/**
	* Convenience function to set up a multiple_choice box
	* A multiple choice differs from a regular choice in that the user can select many options rather than one
	* This function is functionally similar to Choice()
	* @see Choice()
	*/
	function MultipleChoice($choices = null, $key = null, $value = null) {
		$this->Choice($choices, $key, $value);
		$this->type = WAVEFORM_TYPE_MULTIPLE_CHOICE;
		if (!is_array($this->value))
			$this->value = array($this->value);
		return $this;
	}

	/**
	* Shorthand function to define a field as a text blob
	*/
	function Text() {
		$this->type = WAVEFORM_TYPE_TEXT;
		return $this;
	}

	/**
	* Shorthand function to define a field as a label
	* @param string $html The HTML to set as the field value
	*/
	function Label($text = null) {
		$this->type = WAVEFORM_TYPE_LABEL;
		$this->RemoveValidator('required');
		if ($text)
			$this->Default($text);
		return $this;
	}

	/**
	* Alias for Label()
	* @see Label()
	* @param string $html The HTML to set as the field value
	*/
	function ReadOnly($text = null) {
		return $this->Label($text);
	}

	/**
	* Shorthand function to trigger Label() and accept HTML as a value
	* This is really just a dummy field type to inject HTML into the middle of a form
	* @param string $html The HTML to set as the field value
	*/
	function HTML($html = null) {
		return $this->Label($html);
	}

	/**
	* Shorthand function to define a field as a link
	* @param string $link The link value to set
	*/
	function Link($link = null) {
		$this->type = WAVEFORM_TYPE_LINK;
		$this->RemoveValidator('required');
		if ($link)
			$this->Default($link);
		return $this;
	}

	// FILE type {{{
	function ApplyFile() {
		$this->type = WAVEFORM_TYPE_FILE;
		return $this;
	}

	/**
	* Accept a file upload and, if successful, store it as the supplied path
	* * If $path is a directory - The file is saved there and a random file name generated
	* * If $path is a file path + name - The file is saved as that path + name
	* * If $path is omitted - Nothing is done with the incoming file and its name remains as PHP's temporary path storage name
	* The actual name of the file can be accessed using the usual $_POST['file'] variable
	* @param string $path Optional name of a file or directory to save the file in
	*/
	function AcceptFile($path = null) {
		if (!isset($_FILES[$this->field]) || !$_FILES[$this->field]['tmp_name'])
			return $this->Fail('%s requires a file upload');
		if (is_array($_FILES[$this->field]['tmp_name'])) { // Uploading multiple files
			$_POST[$this->field] = array();
			foreach ($_FILES[$this->field]['tmp_name'] as $tmp) {
				if (! $dst = $this->_AcceptFile($tmp, $path))
					return $this->Fail('Cannot save %s uploaded file');
				$_POST[$this->field][] = $dst;
			}
		} else {
			if ($dst = $this->_AcceptFile($_FILES[$this->field]['tmp_name'], $path)) {
				$this->value = $dst;
				$_POST[$this->field] = $dst;
				return $this->Pass();
			} else
				return $this->Fail('Cannot save %s uploaded file');
		}
	}

	/**
	* Actual worker for CheckFile()
	* @see CheckFile()
	* @param string $tmppath Where PHP is storing the temporary file
	* @param string $path Optional directory or file where the file should be saved
	* @return string The actual path where the file ended up
	*/
	function _AcceptFile($tmppath, $path) {
		if (!$path)
			return $tmppath;
		if (is_dir($path)) {
			$path = $path . '/' . basename(tempnam($path, ''));
		} elseif (!is_dir(dirname($path)))
			trigger_error("Cannot save file (specified under field '{$this->field}' to '$path'");
		return move_uploaded_file($tmppath, $path) ? $path : FALSE;
	}
	// }}} FILE type

	/**
	* Shorthand function to define a field as a password
	* @param bool $twice Ask for this field twice (i.e. if accepting the password from the user for the first time)
	*/
	function Password($twice = TRUE) {
		$this->type = WAVEFORM_TYPE_PASSWORD;
		if ($twice) {
			$this->parent->Define($cloned = $this->field . '_again')
				->Title($this->title . ' again')
				->Type('password')
				->_style = $this->_style;
			$this->SameAs($cloned, 'Passwords must match');
		}
		return $this;
	}

	/**
	* Shorthand function to define a field as a date / epoc type
	* @param string $format The format of the date as supported by PHP's DATE function
	* @see Date()
	*/
	function Date($format = 'd/m/Y') {
		$this->format = $format;
		$this->type = WAVEFORM_TYPE_EPOC;
		if ($this->value === null || $this->value === '') { // Value is null
			$this->value = null;
		} elseif (!preg_match('/^\-?[0-9]+$/', $this->value)) // Convert string to int if we already are using a value (such as those supplied in POST)
			$this->value = $this->parent->UnDate($format, $this->value);
		return $this;
	}

	/**
	* Shorthand function to define a field as a date / epoc type
	* @see Date()
	*/
	function Epoc() {
		return $this->Date();
	}

	/**
	* Setup a simple checkbox
	*/
	function Checkbox() {
		$this->type = WAVEFORM_TYPE_CHECKBOX;
		$this->value = (isset($_POST[$this->field])); // Import correct value from _POST
		$this->NotRequired();
	}

	/**
	* Setup a Choice system with 'Yes/No' choices
	*/
	function YesNo() {
		return $this->Choice(array(
			'1' => 'Yes',
			'0' => 'No',
		));
	}

	/**
	* Apply a standard email filter
	*/
	function Email() {
		$this->type = WAVEFORM_TYPE_STRING;
		$this->Validate('re', '/^([.0-9a-z_-]+)@(([0-9a-z-]+\.)+[0-9a-z]{2,4})$/i', 'Invalid email address');
		return $this;
	}

	/**
	* Apply a standard URL filter
	*/
	function URL() {
		$this->type = WAVEFORM_TYPE_STRING;
		$this->Validate('re', '!^http(s)?://[a-z0-9-_.]+\.[a-z]{2,4}!i', 'Invalid URL');
		return $this;
	}

	/**
	* Set the default value if one does not already exist
	* @param mixed $value Value to set
	*/
	function Defaults($value) {
		if ($this->value === NULL)
			$this->value = $value;
		return $this;
	}
	// }}} Convenience functions

	// Built-in validation methods {{{
	/*
	Each validator can have optional funciton prefixes.
	For example lets assume 'Foo' is a test that is to be applied with '$WaveForm->Define('field')->Foo()
	* If 'ApplyFoo(params...)' exists it is called when initalizing the test
		- If this function returns FALSE the validator is not added to the validator stack and all subsequent stages are not applied
	* If 'CheckFoo(params...)' exists then it is called to validate that test.
		- It must return with either 'return $this->Pass()' or return '$this->Fail()'. If CheckFoo does not exist Pass() is assumed.
	* If 'AcceptFoo(params...)' exists then it is run after all other fields pass validation (e.g. processing large file uploads only if all validation complete)
	*/

	/**
	* Special handling of the NotRequired funciton.
	* This really just removes any existing 'Required' validators
	*/
	function ApplyNotRequired() {
		$this->RemoveValidator('required');
		return FALSE;
	}

	function CheckRequired($isrequired = TRUE) {
		if (!$isrequired) // If its not required, then we dont care
			return $this->Pass();
		if ($this->type == WAVEFORM_TYPE_FILE) // Special handling for files
			if (isset($_FILES[$this->field]) && $_FILES[$this->field]['tmp_name']) {
				return $this->Pass();
			} else
				return $this->Fail("%s file is required");
		if (trim($this->value) == '')
			return $this->Fail("%s is required");
		return $this->Pass();
	}

	function CheckMin($size = 0) {
		if (!$this->value) { // Not specified so it must pass. Use ->Required() if its actually needed
			return $this->Pass();
		} elseif ($this->type == WAVEFORM_TYPE_FLOAT && ((float) $this->value < (float) $size)) {
			return $this->Fail("%s must be at least $size");
		} elseif ($this->type == WAVEFORM_TYPE_INT && ((int) $this->value < (int) $size)) {
			return $this->Fail("%s must be at least $size");
		} elseif ($this->type == WAVEFORM_TYPE_STRING && strlen($this->value) < $size) // Assume string length in all other cases
			return $this->Fail("%s must be at least $size characters");
		return $this->Pass();
	}

	function CheckMax($size = 100) {
		if (!$this->value) { // Not specified so it must pass. Use ->Required() if its actually needed
			return $this->Pass();
		} elseif ($this->type == WAVEFORM_TYPE_FLOAT && ((float) $this->value > (float) $size)) {
			return $this->Fail("%s has a maximum of $size");
		} elseif ($this->type == WAVEFORM_TYPE_INT && ((int) $this->value > (int) $size)) {
			return $this->Fail("%s has a maximum of $size");
		} elseif ($this->type == WAVEFORM_TYPE_STRING && strlen($this->value) > $size) // Assume string length in all other cases
			return $this->Fail("%s cannot be more than $size characters");
		return $this->Pass();
	}

	/**
	* Test a regular expression against a field
	* @param string $regexp The regular expression to test. This must be a complete reg-exp including surrounds e.g. (/regexp/i or !regexp!g or (regexp))
	* @param string $message Optional error message to return if this test fails
	*/
	function CheckRE($regexp, $message = 'Invalid %s') {
		return ($this->value == '' || preg_match($regexp, $this->value)) ? $this->Pass() : $this->Fail($message);
	}

	/**
	* Test a regular expression against a field and invert the responce
	* This effectively means that the regular expression is expected to fail and if it passes an error should be generated
	* @param string $regexp The regular expression to test. This must be a complete reg-exp including surrounds e.g. (/regexp/i or !regexp!g or (regexp))
	* @param string $message Optional error message to return if this test fails
	*/
	function CheckREFail($regexp, $message = 'Invalid %s') {
		return (preg_match($regexp, $this->value)) ? $this->Fail($message) : $this->Pass();
	}

	/**
	* Bind a callback validator
	* e.g.
	* $Waveform->Define('foo')->Callback('bar', '%s does not have enough BAR');
	* assumes 'function bar($value)' is defined somewhere
	* @param string $callback The name of the callback function
	* @param string $message The error message to output on failure
	* @param mixed $params... Additional params to pass to the callback function after the inital value
	*/
	function CheckCallback() {
		$params = func_get_args();
		$func = array_shift($params);
		$message = array_shift($params);
		if (call_user_func_array($func, $params)) {
			return $this->Pass();
		} else
			return $this->Fail($message);
	}

	/**
	* Check that the current field is the same as another
	* e.g.
	* $Waveform->Define('email')->SameAs('email_again', 'Emails do not match');
	* @param string $sibling The sibling field that the current field must equal
	* @param string $message The error message to output on failure
	*/
	function CheckSameAs() {
		$params = func_get_args();
		$sibling = array_shift($params);
		$message = count($params) ? array_shift($params) : "{$this->title} must match {$this->parent->_fields[$sibling]->title}";
		if ($this->parent->_fields[$sibling]->value != $this->value)
			return $this->Fail($message);
		return $this->Pass();
	}
	// Built-in validation methods }}}
}
// }}} WaveformField Class
?>

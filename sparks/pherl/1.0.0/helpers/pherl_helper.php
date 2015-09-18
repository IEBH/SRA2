<?php
if (!function_exists('qw')) {
/**
* Quickly initalize arrays by providing a single string. The array elements are determined by any whitespace.
* e.g.
* 	$a = qw('foo bar baz') // Output: array('foo', 'bar', 'baz')
* 	$a = qw('foo    bar    baz') // Same as above, as is any whitespace including line feeds
* @param string $string The string to split
* @return array The input $string variable split into an array by its whitespace
*/
function qw($string) {
	return preg_split('/\s+/', $string);
}
}


if (!function_exists('keyval')) {
/**
* Quickly reorder arrays by picking the key and value arrangement from an array of arrays
* e.g.
*	$in = array(
*		array(
*			'name' => 'Earl',
*			'age' => 35,
*		),
*		array(
*			'name' => 'John',
*			'age' => 24,
*		),
*	);
*
*	$a = keyval('name', 'age', $in); // $a is now array('Earl' => 35, 'John' => 24)
*
* @param string $key The key to extract from the array of arrays
* @param string $val The value to extract from the array of arrays
* @return array A key/value associative array with the $key and $val extracted
*/
function keyval($key, $val, $array) {
	$out = array();
	foreach ($array as $item)
		if (isset($item[$key]) && isset($item[$val]))
			$out[$item[$key]] = $item[$val];
	return $out;
}
}


if (!function_exists('pick')) {
/**
* Pick a random element from an array
* e.g.
* 	$a = pick(qw('foo bar baz')) // Output: foo, bar or baz (randomly)
* @param array $arr The array to pick from
* @return mixed A single random element of the array
*/
function pick($arr) {

	$i = rand(0,count($arr)-1);
	return $arr[$i];
}
}


if (!function_exists('encase')) {
/**
* Encase all elements of an array with a given prefix and suffix
* e.g.
* 	$a = encase(qw('foo bar baz'), '"', '"') // $a = "foo", "bar" or "baz" (as in a literal string with the words between '"' characters)
* 	$b = encase(qw('foo bar baz'), '<', '>') // $a = <foo>, <bar>, <baz>
* 	$c = encase(qw('foo bar baz')) // $a = "foo", "bar", "baz"
* @param array $arr The array to iterate and apply the elemnts to
* @param string $prefix The prefix string to add to all elements of $arr
* @param string $suffix The suffix string to add to all ements of $arr. If this is null its value is copied from $prefix
* @return array $arr with all elements enclosed between the $prefix and $suffix characters
*/
function encase($arr, $prefix = '"', $suffix = null) {
	if ($suffix === null)
		$suffix = $prefix;
	$out = array();
	foreach ($arr as $item)
		$out[] = $prefix . $item . $suffix;
	return $out;
}
}


if (!function_exists('evalstr')) {
/**
* Returns a version of a string as if it were given in double speach marks
* e.g. evalstr("Hello {$this->field}") becomes "Hello name" (if $this->name is 'name')
* @param string $text The text to process
* @param array $locals Local variables to provide to the eval'd string
* @return string The result of the processed string
*/
function evalstr($text, $locals = null) {
	if ($locals)
		extract($locals);
	return eval($s = "return \"" . strtr($text, array('"' => '\'')) . "\";"); // Vomit indusing hack to Replace " with \" in eval string
}
}


if (!function_exists('re')) {
/**
* A single function 're' which can run very complex RegExps
* First arg is the Perl compatible RegExp and the second is either a string or array of strings to match.
* e.g.
*
*	// Extract a match from a RegExp
*	list($val) = re('/(some match)dasdas/', $subject); // Sets $val to the matched str
*
*	// Do something only if a RegExp does NOT match
*	if (re('!/(some match)/', $subject)) {} // Returns boolean as to whether the match is present (quicker than above)
*
	// Substituion
*	$val = re('s/123/321/g', $subject) // S(ubstitute) all '123' with '321'
*
*	// Translation
*	$val = re('tr/a-z/A-Z/', $subject) // TR(anslate) upper-case to lower-case
*
*	list($name, $age, $height) = re('m/([a-z]+) is ([0-9]+) years old and is ([0-9\.]+) feet height',$instr); // Nice extraction
*
* Operators (characters that go before the expression):
* * m (or nothing) - Returns all matching elements in a array (if multiple matches [i.e. \1\2\3 etc.] in an array of arrays)
* * s - Return the substution of the RegExp (or the changed array if $target is array)
* * tr - Inline translate (change each character to its corrisponding character)
* * ! - Boolean match return yes or no as to whether the subject is within the target (or in ANY of the targets if its an array)
*
* Modifiers (characters that go after the expression):
* * i - Case insensitive matching
* * g - Subsitute globally - i.e. dont just replace in an s/// operation once
* * s - Treat the incomming target as a string. Change "." to match any character (even a newline)
* * m - Treat string as multiple lines. Change "^" and "$" from matching the start or end of the string to matching the start or end of any line anywhere within the string.
* * 1 - By default RE() will return an array if a capture operation is detected. If this modifier is specified only the first capture result will be returned as a string. This means that you can slurp the match directly into a variable without having to use list()
*
* Flags:
* Flags are used to force a modifier. These are usually determined from the above modifier list
* * RE_FIRSTONLY - Equivelent to the '1' modifier.
* * RE_PENDFULL - Include the full matching string as the first element of the output array
*/
define('RE_FIRSTONLY',1);
define('RE_PENDFULL',2);
define('RE_CROP',4);
function re($exp, $target, $flags = 0) {
	preg_match_all('/^(m|s|tr|\!)?([^a-z0-9])/', $exp, $function, PREG_SET_ORDER); // Determine what type of operation to do & the split char
	$splitter = $function[0][2];
	$splitterq = preg_quote($splitter, $splitter);
	$operation = $function[0][1];
	$exp = ltrim($exp, $operation); // Remove the leading operation character (PHP PREG lib doesnt like it)

	preg_match("/{$splitterq}([igsm1]*)$/i", $exp, $mutators);
	$mutators = isset($mutators[1]) ? $mutators[1] : '';
	if (strpos($mutators, '1') !== FALSE) {
		$flags = $flags & RE_FIRSTONLY;
		$mutators = strtr($mutators, array('1' => '')); // Remove special mutator from stream
		$exp = substr($exp, 0, strlen($exp) - (strlen($mutators) + 1));
	}
	
	switch ($operation) { // What operation are we doing
		case 's': // Substitution
			if (!preg_match_all("/^$splitterq(.*)$splitterq(.*)$splitterq/", $exp, $matches, PREG_SET_ORDER)) {
				if (!preg_match_all("/^$splitterq(.*)$splitterq(.*)$splitterq/", $exp. $splitter, $matches,PREG_SET_ORDER)) { // Mangled re-exp - maybe the user was being lazy and left off the last splitter char?
					trigger_error("Mangled regex in subsitution RE() operation - $exp", E_USER_ERROR);
					return $target;
				}
			}
			if (is_array($target)) {
				$out = array();
				foreach ($target as $thistarget)
					$out[] = preg_replace("$splitter{$matches[0][1]}$splitter", $matches[0][2], $target);
				return $out;
			} else
				return preg_replace("$splitter{$matches[0][1]}$splitter", $matches[0][2], $target, (strpos($mutators, 'g') === FALSE) ? 1 : -1);
			break;
		case 'tr': // Translation - FIXME: Dont think this works properly. Its using strtr rather than preg
			preg_match_all("/^$splitterq(.*)$splitterq(.*)[$splitterq]$/i", $exp, $matches, PREG_SET_ORDER);
			if (is_array($target)) {
				$out = array();
				foreach ($target as $thistarget)
					$out[] = strtr($thistarget, $matches[0][1], $matches[0][2]);
				return $out;
			} else
				return strtr($target, $matches[0][1], $matches[0][2]);
			break;

		case '!':
		case 'm':
		default: // Match
			if (!preg_match("/^$splitterq(.*)$splitterq/", $exp)) { // Looks like a valid expression?
				if (!preg_match("/^$splitterq(.*)$splitterq/", $exp . $splitter)) { // Mangled re-exp - maybe the user was being lazy and left off the last splitter char?
					trigger_error("Mangled regex in match RE() operation - $exp", E_USER_ERROR);
					return $operation != '!' ? FALSE : TRUE;
				} else
					$exp .= $splitter;
			}
			if (is_array($target)) {
				$out = array();
				foreach ($target as $thistarget) {
					preg_match_all($exp, $thistarget, $matches, PREG_SET_ORDER);
					if (($flags & RE_PENDFULL) == RE_PENDFULL) // Have to go though and put the thing in
						foreach ($matches as $index => $match)
							array_unshift($matches[$index], $thistarget);
					if (isset($matches[0]))
						$out[] = $matches[0];
				}
				return $out;
			} else {
				if (!preg_match('/[^\\\\]\(/', $exp)) { // Not capturing - only testing
					if ($operation == '!')
						return (bool) !preg_match($exp, $target);
					return (bool) preg_match($exp, $target);
				} else { // Capturing - return array
					$out = array();
					preg_match_all($exp, $target, $matches, PREG_SET_ORDER);
					if (($flags & RE_FIRSTONLY) != RE_FIRSTONLY) // Only return first match
						return isset($matches[0][1]) ? $matches[0][1]: FALSE;
					foreach ($matches as $match)
						$out[] = $match[1];	
					return $out;
				}
			}
	}
}
}

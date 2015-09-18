Pherl - Perl like functionality for PHP
=======================================

This Spark module is intended to provide simple Perl like functionality for PHP users.

It contains a number of convenience functions cheerfully ripped from the Perl programming languages which make coding a lot easier for the terminally impatient.

* __QW__ - Quick array initalization via simple strings
* __KEYVAL__ - Extract a key=>val relationship from an array-of-arrays
* __PICK__ - Randomly pick elements from an array
* __ENCASE__ - Quickly add a prefix / suffix to an array of strings
* __EVALSTR__ - Process a string similar to how PHP expands variables
* __RE__ - Perl like regular expression syntax for PHP


`qw` - Quick array initalizer
=============================
Quickly initalize arrays by providing a single string. The array elements are determined by any whitespace.

	// Create an array with three elements (foo, bar and baz)
	$array = qw('foo bar baz');

	$array = qw('foo    bar    baz');

	$array = qw('
		foo
		bar
		baz
	');


`keyval` - Create a key/val relationship from an array-of-arrays
================================================================
Quickly reorder arrays by picking the key and value arrangement from an array of arrays

	$in = array(
		array(
			'name' => 'Earl',
			'age' => 35,
		),
		array(
			'name' => 'John',
			'age' => 24,
		),
	);
	
	$a = keyval('name', 'age', $in); // $a is now array('Earl' => 35, 'John' => 24)


`pick` - Pick random elements from an array
===========================================
Choose a single random element from an array.

	$item = pick(qw('foo bar baz')); // Chooses either foo, bar or baz


`encase` - Add a prefix / suffix to an array of strings
=======================================================
The `encase()` function allows you to quickly enclose each string in an array with a given prefix and suffix.

	$tags = encase(qw('a img hr', '<', '>')); // Returns: <a>, <img>, <hr>


`evalstr` - Expand PHP style strings
====================================
Return the computed result of a string using local variables.

	echo evalstr('Hello $name', array('name' => 'Matt')); // Returns Matt

	echo evalstr('Hello {$user['name']}', array('user' => $this->GetAUser(123))); // Returns the 'user' objects 'GetAUser' methods 'name' property


`re` - Perl like Regular Expressions
====================================
The Re() function provides Regular Expression functionality in a Perl like way.


Simple matching
---------------
Determine if the string 'needle' exists in $haystack:

	if (re('/needle/', $haystack)) {
		// Do something
	}


Simple extraction
-----------------
Extract a match from an input string

	$haystack = 'foo bar baz quz quuz';
	list($word) = re('/(qu.)/', $haystack);
	echo $word; // Output: 'quz'

RE can also return only the first captured element by using the '1' modifier. The following code will act the same as the above but force the only match into a string rather than an array:

	$haystack = 'foo bar baz quz quuz';
	$word = re('/(qu.)/1', $haystack);
	echo $word; // Output: 'quz'


Multiple extraction into an array
---------------------------------
Extract multiple matches into an array

	$haystack = 'foo bar baz quz quuz';
	$words = re('/(ba.)/', $haystack);
	print_r($words); // Output: array('bar', 'baz')

This is the same syntax as Simple Extraction. When multiple elements are found RE will return the elements as an array automatically.


Multiple extraction into variables
----------------------------------
You can use PHP's list() function to automatically cram the output of RE into a series of variables.

	$haystack = 'Matt is 28 years old';
	list($name, $age) = re('/^(.+?) is ([0-9]+) years old$/', $haystack);


Simple substitution and replacement
--------------------------------
Substitution (also known as replacement) is also supported.

	$haystack = 'foo bar baz foo bar baz';
	$output = re('s/bar/BAR/', $haystack);
	echo $output; // Output: 'foo BAR baz foo bar baz'

By default only the first matching element is replaced. If you want to replace all matching items use the 'g' modifier:

	$haystack = 'foo bar baz foo bar baz';
	$output = re('s/bar/BAR/', $haystack);
	echo $output; // Output: 'foo BAR baz foo BAR baz'


Substitution with back-references
---------------------------------
Replace the words 'bar' and 'baz' into 'FOUND-r' and 'FOUND-z':

	$haystack = 'foo bar baz';
	$output = re('s/(ba.)/FOUND-\1/', $haystack);
	echo $output; // Output: 'foo FOUND-bar FOUND-baz'

\1 and onwards is automatically set to the captured item.


Translation
-----------
Although not really used that much you can replace single characters based on a range:

	$haystack = 'foo bar baz';
	$output = re('tr/a-z/A-Z');
	echo $output; // Output: 'FOO BAR BAZ'


Perl to PHP reference
---------------------
This section contains some commonly used Perl syntax and the PHP equivelent when using this module.
This is included because sometimes examples are more helpful than API waffle.

<table>
	<tr>
		<th>Example</th>
		<th>Perl</th>
		<th>PHP + Pherl</th>
	</tr>
	<tr>
		<th>Extraction</th>
		<td>
<pre>
$_ = 'foo bar baz';
($one, $two, $three) =~ m/(.*) .{3} .../;
</pre>
		</td>
		<td>
<pre>
$haystack = 'foo bar baz';
list($one, $two, $three) = re('m/(.*) .{3} .../', $haystack);
</pre>
		</td>
	</tr>
	<tr>
		<th>Subsitution</th>
		<td>
<pre>
$_ = 'foo bar baz';
$new = s/foo/QUZ/;
</pre>
		</td>
		<td>
<pre>
$haystack = 'foo bar baz';
$new = re('s/foo/QUZ/', $haystack);
</pre>
		</td>
	</tr>
	<tr>
		<th>Translation</th>
		<td>
<pre>
$_ = 'foo bar baz';
$new = tr/a-z/A-Z/;
</pre>
		</td>
		<td>
<pre>
$haystack = 'foo bar baz';
$new = re('tr/a-z/A-Z/', $haystack);
</pre>
		</td>
	</tr>
</table>


TODO
====

* Translation (tr//) not working correctly
* Support for callback functions for substitutions

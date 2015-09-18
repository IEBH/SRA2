RefLib
======
PHP module for managing a variety of citation reference libraries.

At present this library can read/write the following citation library formats:

* EndNote (XML)
* [RIS](https://en.wikipedia.org/wiki/RIS_(file_format))
* CSV files


Installation
------------
The easiest way to install is via Composer - `composer require hashbang/reflib`

If you wish to install *without* composer then download the source code, unzip it into a directory include the file in the normal way.


Examples
========

Read in EndNote XML
-------------------

	require('reflib.php');
	$lib = new RefLib();
	$lib->SetContentsFile('tests/data/endnote.xml');

	print_r($lib->refs); // Outputs all processed refs in an associative array


Write EndNote XML
-----------------

	require('reflib.php');
	$lib = new RefLib();
	$lib->SetContentsFile('tests/data/endnote.xml'); // Read in content (or populate $lib->refs yourself)
	$lib->OutputXML('EndNote File.xml'); // Output file to the browser


File conversion
---------------

	require('reflib.php');
	$lib = new RefLib();
	$lib->SetContentsFile('tests/data/endnote.xml'); // Read in content (or populate $lib->refs yourself)
	$lib->OutputXML('EndNote File.ris'); // Output file to the browser in RIS format

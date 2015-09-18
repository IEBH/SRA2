#!/usr/bin/php -qC
<?php
require(dirname(__FILE__) . '/../helpers/pherl_helper.php');
// Test cases:
function testre($title, $expression, $target, $expected) {
	$result = re($expression, $target, $expected);
	if ($result == $expected) {
		echo "Test '$title' [$expression] - OK\n";
	} else {
		echo "Test '$title' [$expression] - FAILED\n";
		echo "Expected: [" . print_r($expected, 1) . "]\n";
		echo "Got: [" . print_r($result, 1) . "]\n";
		echo "\n";
	}
}
testre('Boolean match', 'm/foo/','foo bar baz', TRUE);
testre('Boolean match (multiple matches)', 'm/ba./','foo bar baz', TRUE);
testre('Boolean match (implied function)', '/foo/','foo bar baz', TRUE);
testre('Boolean match (case insensitive)', 'm/fOo/i','foO bar baz', TRUE);
testre('Boolean match (un-closed splitter)', 'm/foo', 'foo bar baz', 'foo QUZ baz');
testre('Boolean match (case insensitive, inverted)', '!/fOo/i','foO bar baz', FALSE);
testre('Single capture', 'm/(fo.)/1','foo bar baz', 'foo');
testre('Single capture as array', 'm/(fo.)/','foo bar baz', array('foo'));
testre('Multiple capture', 'm/(ba.)/','foo bar baz', array('bar', 'baz'));

testre('Single subsitution', 's/ba./QUZ/', 'foo bar baz', 'foo QUZ baz');
testre('Multiple subsitution', 's/ba./QUZ/g', 'foo bar baz', 'foo QUZ QUZ');
testre('Single subsitution (un-closed splitter)', 's/ba./QUZ', 'foo bar baz', 'foo QUZ baz');

testre('Subsitution with back-references (one match)', 's/(ba.)/FOUND-\1/', 'foo bar baz', 'foo FOUND-bar baz');
testre('Subsitution with back-references (multiple matches)', 's/(ba.)/FOUND-\1/g', 'foo bar baz', 'foo FOUND-bar FOUND-baz');

//testre('Translation of a single char', 'tr/a/A/','foo bar baz', 'foo bAr bAz');
//testre('Translation to upper case', 'tr/a-z/A-Z/','foo bar baz', 'FOO BAR BAZ');

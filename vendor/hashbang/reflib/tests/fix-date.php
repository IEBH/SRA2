<?
require_once(dirname(__FILE__) . "/../reflib.php");

$e = new RefLib();
foreach (array(
	'19-19' => '19',
	'24-24s' => 'S24',
	'99 - 103' => '99-103',
	'85-87' => '85-87',
	'219-22' => '219-222',
	's70-5' => 'S70-75',
	'884-9' => '884-889',
	'1173-84s' => 'S1173-1184',
	'S80' => 'S80',
	'S0007' => 'S7',
	'R82' => 'R82',
	'e29-32' => 'e29-32',
	'P4 (Abstract Number)' => 'P4 (Abstract Number)',
	'1396-400; discussion 1400-1' => '1396-400; discussion 1400-1',
	'598s [3625]' => '598s [3625]',
	'viii108' => 'viii108',
	'' => '',
) as $pages => $correct) {
	$ref = $e->FixPages(array('pages' => $pages));
	$return = $ref['pages'];
	echo ($return == $correct ? 'PASS' : 'FAIL') . " - Given [$pages], Returned [$return], Correct [$correct]\n";
}

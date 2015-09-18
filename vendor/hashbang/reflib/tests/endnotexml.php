<?
$dir = dirname(__FILE__);
require_once("$dir/../reflib.php");

$rl = new RefLib();
$rl->SetContentFile("$dir/data/endnote.xml");
echo (count($rl->refs) == 1988 ? 'PASS' : 'FAIL') . " - 1998 references read from EndNote XML file\n";

<?
$dir = dirname(__FILE__);
require_once("$dir/../reflib.php");

$rl = new RefLib();
$rl->SetContentFile("$dir/data/ris.ris");
$got = count($rl->refs);
$want = 101;
echo ($got == $want ? 'PASS' : 'FAIL') . " - 101 references read from EndNote XML file\n";

$got = substr_count($rl->GetContents(), "\n");
$want = 593;
echo ($got == $want ? 'PASS' : 'FAIL') . " - Same file size out output. Got: $got, Want: $want\n";


$rl->SetContentFile("$dir/data/ris.txt");
$got = count($rl->refs);
$want = 510;
echo ($got == $want ? 'PASS' : 'FAIL') . " - $want references read from EndNote XML file. Got: $got, Want: $want\n";

<?
$dir = dirname(__FILE__);
require_once("$dir/../reflib.php");

$rl = new RefLib();
$rl->SetContentFile("$dir/data/csv.csv");

print_r($rl->refs);
echo (count($rl->refs) == 161 ? 'PASS' : 'FAIL') . " - 161 references read from EndNote CSV file\n";

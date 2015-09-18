#!/usr/bin/php
<?
class CI_Model {};

require('../application/models/reference.php');
$r = new Reference;

foreach (array(
	array('Light, Richard W.', 'Light, R. W.', true),
	array('Izbicki, R; Weyhing, B. T. I.; Backer, L', 'Izbicki, R; 3rd; Weyhing, B. T.; Backer, L, Caoili, E. M.l Vaitkevicius, V.K.', true),
	array('Masciom Christopher E.; Austin, Erle H.', 'Masciom, C.E.; Austin, E. H.', true),
	array('Masciom Christopher E.; Austin, Erle H.', 'Mascom, C.E.; Austin, E. H.', true),
	array('Toomes, H', 'Toomes, H.', true),
	array('Brynitz, S; Friis-Moller, A.', 'Brynitz, S; Friis-MØller, A.', true),
	array('Hulzebos, E. H. J; Helders, P. J.; Favie, N. J.', 'Hulzebos, E. H.; Helders, Paul J.; Favie, N. J.', true),
) as $offset => $test) {
	list($a, $b, $expected) = $test;
	echo "* Test $offset. [$a] <=> [$b]";
	$got = $r->CompareAuthors($a, $b);
	if ($got) {
		echo " - PASSED\n";
	} else
		echo " - FAILED (Expected [$expected] Got [$got])\n";
	echo "\n";
}

<ul>
	<?
	foreach ($authors as $a => $junk) {
		$total = 0;
		foreach ($authors as $b => $junk) {
			$key = ($a < $b) ? "$a$sep$b" : "$b$sep$a";
			$val = isset($matrix[$key]) ? $matrix[$key] : '0';
			if ($val == 0)
				continue;
			$total += $val;
		} ?>
		<li><?=$a?> = <?=$total?></li>
	<? } ?>
</ul>

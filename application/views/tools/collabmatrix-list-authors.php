<ul>
	<? foreach ($authors as $a => $junk) { ?>
		<? foreach ($authors as $b => $junk) {
			$key = ($a < $b) ? "$a$sep$b" : "$b$sep$a";
			$val = isset($matrix[$key]) ? $matrix[$key] : '0';
			if ($val == 0)
				continue;
		?>
		<li><?=$a?> &amp; <?=$b?> = <?=$val?></li>
		<? } ?>
	<? } ?>
</ul>

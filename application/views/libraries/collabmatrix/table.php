<style>
body {
	overflow-x: auto;
}
</style>
<table class="table table-bordered table-striped">
	<tr>
		<th>&nbsp;</th>
		<? foreach ($authors as $a => $junk) { ?>
		<th><?=$a?></th>
		<? } ?>
	</tr>
	<? foreach ($authors as $a => $junk) { ?>
	<tr>
		<th><?=$a?></th>
		<? foreach ($authors as $b => $junk) {
			$key = ($a < $b) ? "$a$sep$b" : "$b$sep$a";
		?>
		<td><?=isset($matrix[$key]) ? $matrix[$key] : '&nbsp;'?></td>
		<? } ?>
	</tr>
	<? } ?>
</table>

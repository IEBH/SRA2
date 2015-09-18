<? if (isset($GLOBALS['messages']) && is_array($GLOBALS['messages']) && $GLOBALS['messages']) {
	echo "<div class=\"container mainContent\"><div class=\"row-fluid\">";
	foreach ($GLOBALS['messages'] as $message) {
		list($type, $text) = $message;
		echo "<div class=\"alert alert-block alert-$type\">$text</div>";
	}
	echo "</div></div>";
}?>

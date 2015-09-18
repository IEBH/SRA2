<?php
/**
* Simple Waveform form output view
*
* Optional named parameters:
*
* @param string $header Either HTML or plaintext header to output (if plaintext, it will be wrapped in <p> tags)
*
*/
if (isset($header)) // Output header (if any)
	echo (substr($header, 0, 1) == '<') ? $header : "<p>$header</p>";
echo $this->waveform->Form();

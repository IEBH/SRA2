<?
class Format extends CI_Model {
	/**
	* Format a money amount and return as a string
	* @param float $value The amount to be formatted
	* @param bool $dp Force decimal place viewing (otherwise its clipped)
	* @return string The local equivelent money value as a string
	*/
	function Money($value, $dp = FALSE) {
		return '$' . number_format($value, $dp ? 2 : 0);
	}

	/**
	* Format a number in a human readable way
	* @param float $value The number to be formatted
	* @return string The incomming value formatted as a number
	*/
	function Number($value) {
		return number_format($value);
	}

	/**
	* Similar to Number() but formats a file size to a human readable size
	* @param int $size Number of bytes to format
	* @return string Human readable file size
	*/
	function Size($size) {
		$sizes = array('Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB');
		if ($size == 0) return('n/a');
		return (round($size/pow(1024, ($i = floor(log($size, 1024)))), 2) . ' ' . $sizes[$i]);
	}

	/**
	* Format a float as a percentage in a human readable way
	* @param float $value The value to be formatted
	* @return string The incomming value formatted as a percentage
	*/
	function Percent($value, $dp = 2) {
		return number_format($value * 100, $dp);
	}

	/**
	* Format a date in a human readable format
	* @param int $epoc The Unix epoc to be formatted
	* @param string $default What string value to return if $epoc <= 0
	* @return string The incomming value epoc as a real date
	*/
	function Date($epoc, $default = 'never') {
		return $epoc ? date('d/m/Y H:i', $epoc) : $default;
	}
}

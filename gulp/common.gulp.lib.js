/**
* Gulp library that provides common utils used in gulp tasks for the app
*/

(function(common) {

	// Bindable members declared at top
	common.bytediffFormatter = bytediffFormatter;
	common.formatPercent = formatPercent;

	/**
	 * Formatter for bytediff to display the size changes after processing
	 * @param {Object} data - byte data
	 * @return {string} Difference in bytes, formatted
	 */
	function bytediffFormatter(data) {
		var difference = (data.savings > 0) ? ' smaller.' : ' larger.';
		return data.fileName + ' went from ' +
			(data.startSize / 1000).toFixed(2) + ' kB to ' + (data.endSize / 1000).toFixed(2) + ' kB' +
			' and is ' + common.formatPercent(1 - data.percent, 2) + '%' + difference;
	}

	/**
	 * Format a number as a percentage
	 * @param {number} num - Number to format as a percent
	 * @param {number} precision - Precision of the decimal
	 * @return {string} Formatted percentage
	 */
	function formatPercent(num, precision) {
		return (num * 100).toFixed(precision);
	}
})(module.exports);

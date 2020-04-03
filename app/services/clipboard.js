/**
* Basic clipboard access
* This unit is designed as an all-purpose work around the madness and vice that is Clipboard management in modern browsers
* Copy + Paste functionality will be appended to this module only when I'm crazy / drunk enough to even attempt that
*
* @author Matt Carter <m@ttcarter.com>
* @date 2017-03-24
* @example
* $clipboard.copy('Hello World')
*/

app.service('$clipboard', function($window) {
	var $clipboard = this;

	/**
	* Copy text to the clipboard in the supidest yet consistant way imagineable
	* @param {string} text Text to copy
	*/
	$clipboard.copy = function(text) {
		var copyDiv = document.createElement('div');
		copyDiv.contentEditable = true;
		document.body.appendChild(copyDiv);
		copyDiv.innerHTML = text;
		copyDiv.unselectable = "off";
		copyDiv.focus();
		document.execCommand('SelectAll');
		document.execCommand("Copy", false, null);
		document.body.removeChild(copyDiv);
	};

});

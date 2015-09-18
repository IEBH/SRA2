/**
* Shoelace Javascript file
* @author Matt Carter <m@ttcarter.com>
*/
$.fn.shoelace = function() {
	var me = $(this);

/* data-tip {{{ */
me.find('[data-tip]').each(function() {
	var root = $(this);
	var addto = root;
	var tag = root[0].nodeName.toLowerCase();
	if (tag == 'th' || tag == 'td') // Fix for TR, TH elements with a tooltip
		addto = root.wrapInner('<div></div>').children('div');
	settings = {title: root.data('tip')};
	if (root.data('tip-placement'))
		settings['placement'] = root.data('tip-placement');
	addto
		.tooltip('destroy')
		.tooltip(settings);
});
/* }}} */
/* data-prefix, data-suffix {{{ */
me.find('[data-prefix], [data-suffix]').each(function() {
	var me = $(this);
	me.wrap('<div class="' + (me.data('prefix') ? 'input-prepend ' : '') + (me.data('suffix') ? 'input-append' : '') + '"></div>');
	if (me.data('prefix'))
		me.before('<span class="add-on">' + me.data('prefix') + '</span>');
	if (me.data('suffix'))
		me.after('<span class="add-on">' + me.data('suffix') + '</span>');
});
/* }}} */
/* data-help-inline, data-help-block {{{ */
me.find('[data-help-inline]').each(function() {
	$(this).after('<span class="help-inline">' + $(this).data('help-inline') + '</span>');
});
me.find('[data-help-block]').each(function() {
	$(this).after('<span class="help-block">' + $(this).data('help-block') + '</span>');
});
/* }}} */
/* data-focus {{{ */
me.find('[data-focus]').each(function() {
	if (!$(this).closest('.modal').length && $(this).is(':visible')) // Not within a modal && is visible
		$(this).trigger('focus');
	return false; // Only focus the first one
});
me.find('.modal').on('shown', function() {
	$(this).find('[data-focus]').trigger('focus');
});
/* }}} */
/* data-selected {{{ */
me.find('.nav-tabs[data-selected]').each(function() {
	var hash;
	if ($(this).data('selected') == 'auto' && location.hash) {
		hash = location.hash.substr(1);
	} else if ($(this).data('selected')) {
		hash = $(this).data('selected');
	}
	var selected = $(this).find('a[href="#' + hash + '"]');
	if (selected.length) { // Found something - select it
		selected.tab('show');
	} else { // Nothing found - fallback to first found tab
		selected = $(this).find('a:first[href]');
		if (selected.length)
			selected.tab('show');
	}
});
/* }}} */
/* data-selectbyurl {{{ */
/**
* Perform a depth first nav-list traversal to find the most probable link to select from a set
* Because we could be at a really deeply nested page like /foo/bar/baz we need to select any link that points to /foo/bar but not /foo
* This upshot is that we highlight the correct (usually) link in a Bootstrap .nav-list whenever the page loads
* @author Matt Carter <m@ttcarter.com>
*/
me.find('[data-selectbyurl]').each(function() {
	var children = $(this).find($(this).data('selectbyurl') || 'li');
	var parents = $(this).find($(this).data('selectbyurl-parents') || '');
	var myLocation = $(this).data('selectbyurl-url') || window.location.pathname;
	var useRough = $(this).data('selectbyurl-rough') || 0;
	var selected;
	var selectedlink;

	if (myLocation == '/' && children.find('a[href="/"]').length) { // Root item selected
		selected = children.find('a[href="/"]').closest('li');
	} else
		children.each(function() {
			var href = $(this).find('a').attr('href');
			if (href && href == myLocation) { // Exact matches get caught immediately
				selected = $(this);
				return false;
			} else if ( // Imprecise (fuzzy) matches need to be examined
				href // Has a href
				&& (href.substr(0, myLocation.length) == myLocation) // beginning of href matches beginning of myLocation
				&& (!selectedlink || $(this).attr('href').length > selectedlink.length) // Its longer than the last match
			) {
				selected = $(this);
				selectedlink = selected.attr('href');
			} else if ( // Even more rough matching
				useRough
				&& myLocation.substr(0, href.length) == href
			) {
				selected = $(this);
				selectedlink = selected.attr('href');
			}
		});
	if (selected) {
		selected.addClass('active');
		if (parents)
			selected.parents(parents)
				.addClass('active');
	}
});
/* }}} */
// data-confirm {{{
me.find('a[data-confirm]').click(function(event) {
	var message = $(this).data('confirm') || 'Are you really sure you wish to do this?';
	if (!confirm(message))
		event.preventDefault();
});
// }}}
// .dropdown-fix-clipping {{{
me.find('.dropdown-fix-clipping').each(function() {
	var sibling = $(this).prev('[data-toggle=dropdown]');

	var ddno = 1;
	var ddid = 'dropdown1';
	while ($('#' + ddid).length) {
		ddno++;
		ddid = 'dropdown' + ddno;
	}

	if (sibling.attr('href') == '#') {
		sibling
			.attr('href', '#' + ddid)
			.addClass('dropdown-toggle');
		$(this)
			.attr('id', ddid)
			.appendTo($('body'))
			.css({left: sibling.offset().left, top: sibling.offset().top + sibling.height() + 10});
	}
});
// }}}

};

$(function() {
	$(document).shoelace();
});

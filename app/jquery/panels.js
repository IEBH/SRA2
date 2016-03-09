$(document).on('click', '[data-dismiss=panel]', function(e) {
	e.stopPropagation();
	var pan = $(this).closest('.panel');
	if (pan.length) pan.slideUp();
});

$(document).on('click', '[data-collapse=panel]', function(e) {
	e.stopPropagation();

	var pan = $(this).closest('.panel');
	if (!pan.length) {
		console.warn('Cannot find panel to collapse');
		return;
	}

	var panBody = pan.find('.panel-body');
	if (panBody.is(':hidden')) {
		panBody.slideDown();
		if ($(this).find('i.fa-plus')) $(this).find('i.fa-plus').removeClass('fa-plus').addClass('fa-minus');
	} else {
		panBody.slideUp();
		if ($(this).find('i.fa-minus')) $(this).find('i.fa-minus').removeClass('fa-minus').addClass('fa-plus');
	}
});

describe('myController', function () {

	it('the dom initially has a greeting', function () {
		browser.get('/#/polyglot');
		expect( element( by.model('query') ).isPresent()).toBe(true);
	});

});

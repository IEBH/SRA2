exports.config = {
	framework: 'mocha',
	seleniumAddress: 'http://localhost:4444/wd/hub',
	specs: ['./e2e/*.*'],
	baseUrl: 'http://localhost:80'
};

module.exports = {
	host: process.env.OPENSHIFT_NODEJS_IP,
	port: process.env.OPENSHIFT_NODEJS_PORT,
	url: 'http://FIXME.rhcloud.com',
	openshift: {
		project: 'FIXME',
		configFile: '~/.openshift/express.conf'
	},
};

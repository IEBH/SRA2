if (!process.env.VCAP_SERVICES) throw new Error('Trying to load AppFog profile but VCAP_SERVICES is not specified');

var appfogConfig = JSON.parse(process.env.VCAP_SERVICES);
var afmongo = appfogConfig['mongodb-1.8'][0]['credentials'];

module.exports = {
	host: (process.env.VCAP_APP_HOST || 'localhost'),
	port: process.env.VMC_APP_PORT,
	mongo: {
		uri: (afmongo.username && afmongo.password) ?
			"mongodb://" + afmongo.username + ":" + afmongo.password + "@" + (afmongo.hostname || 'localhost') + ":" + (afmongo.port || 27017) + "/" + afmongo.db :
			"mongodb://" + (afmongo.hostname || 'localhost') + ":" + (afmongo.port || 27017) + "/" + afmongo.db,
	},
};

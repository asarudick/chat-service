export default {
	tcpPort: 3000,
	httpPort: 3001,

	// Child objects are passed to redis.createClient() as the options parameter
	// See https://www.npmjs.com/package/redis for more information abotu the options.
	redis: {
		pub : {
			host: 'localhost',
			port: 6379,
			family: 'IPv4'
		},
		sub : {
			host: 'localhost',
			port: 6379,
			family: 'IPv4'
		},
		store : {
			host: 'localhost',
			port: 6379,
			family: 'IPv4'
		},
	}
};

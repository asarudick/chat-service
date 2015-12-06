export default {
	tcpPort: 3000,
	httpPort: 3001,

	// Child objects are passed to redis.createClient() as the options parameter
	// See https://www.npmjs.com/package/redis for more information abotu the options.
	redis: {
		pub : {
			host: 'localhost',
			port: 6379,
			family: 'IPv4',
			url: process.env.REDIS_URL
		},
		sub : {
			host: 'localhost',
			port: 6379,
			family: 'IPv4',
			url: process.env.REDIS_URL
		},
		store : {
			host: 'localhost',
			port: 6379,
			family: 'IPv4',
			url: process.env.REDIS_URL
		},
	}
};

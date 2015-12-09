export default {
	tcp: {
		ports: [ 3000, 3002, 3004, 3006 ],
		enabled: true
	},
	telnet: {
		ports: [ 23, 3008, 3009, 3010 ],
		enabled: true
	},
	http: {
		ports: [ 3001, 3003, 3005, 3007 ],
		enabled: true
	},
	// Child objects are passed to redis.createClient() as the options parameter
	// See https://www.npmjs.com/package/redis for more information abotu the options.
	redis: {
		pub : {
			host: 'localhost',
			port: 6379,
			family: 'IPv4',
			url: process.env.REDIS_URL,
			// Should be high enough for the # of servers using the client.
			maxListeners: 30
		},
		sub : {
			host: 'localhost',
			port: 6379,
			family: 'IPv4',
			url: process.env.REDIS_URL,
			// Should be high enough for the # of servers using the client.
			maxListeners: 30
		},
		store : {
			host: 'localhost',
			port: 6379,
			family: 'IPv4',
			url: process.env.REDIS_URL,
			// Should be high enough for the # of servers using the client.
			maxListeners: 30
		},
	}
};

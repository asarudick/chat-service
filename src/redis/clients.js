import redis from 'redis';
import Promise from 'bluebird';
import winston from 'winston';
import config from '../config/app';

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

//  Redis pub/sub clients.
var pub = redis.createClient(config.redis.pub);

pub.setMaxListeners(config.redis.pub.maxListeners);

pub
	.on('connect', () => {
		winston.info(`Redis pub client connected to ${pub.address}.`);
	})
	.on('ready', () => {
		winston.info(`Redis pub client is ready. Server redis version: ${pub.server_info.redis_version}`);
	})
	.on('reconnect', (delay, attempt) => {
		winston.info(`Redis pub client reconnecting in ${delay}ms. Attempt #${attempt}.`);
	})
	.on('end', () => {
		winston.info(`Redis pub client disconnected.`);
	});

var sub = redis.createClient(config.redis.sub);

sub.setMaxListeners(config.redis.sub.maxListeners);

sub
	.on('connect', () => {
		winston.info(`Redis sub client connected to ${sub.address}.`);
	})
	.on('ready', () => {
		winston.info(`Redis sub client is ready. Server redis version: ${sub.server_info.redis_version}`);
	})
	.on('reconnect', (delay, attempt) => {
		winston.info(`Redis sub client reconnecting in ${delay}ms. Attempt #${attempt}.`);
	})
	.on('end', () => {
		winston.info(`Redis sub client disconnected.`);
	});

sub.subscribe('global');

// Redis cache store.
var store = redis.createClient(config.redis.store);

store.setMaxListeners(config.redis.store.maxListeners);

store
	.on('connect', () => {
		winston.info(`Redis store client connected to ${store.address}.`);
	})
	.on('ready', () => {
		winston.info(`Redis store client is ready. Server redis version: ${store.server_info.redis_version}`);
	})
	.on('reconnect', (delay, attempt) => {
		winston.info(`Redis store client reconnecting in ${delay}ms. Attempt #${attempt}.`);
	})
	.on('end', () => {
		winston.info(`Redis store client disconnected.`);
	});

export { pub, sub, store };

import redis from 'redis';
import Promise from 'bluebird';
import winston from 'winston';
import config from '../config/app';

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

//  Redis pub/sub clients.
var pub = redis.createClient(config.redis.pub);
pub.on('connect', () => {
    winston.info(`Redis pub client connected to ${pub.address}`);
});

var sub = redis.createClient(config.redis.sub);

sub.on('connect', () => {
    winston.info(`Redis sub client connected to ${sub.address}`);
});

sub.subscribe('global');

// Redis cache store.
var store = redis.createClient(config.redis.store);

store.on('connect', () => {
    winston.info(`Redis store client connected to ${store.address}`);
});

export { pub, sub, store };

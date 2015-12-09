
import sourceMapSupport from 'source-map-support';
sourceMapSupport.install({
    handleUncaughtExceptions: false,
    node: true
});

import config from './config/app';
import HttpChatServer from './servers/http';
import TcpChatServer from './servers/tcp';
import TelnetChatServer from './servers/telnet';
import roomManager from './managers/room';
import userManager from './managers/user';
import Promise from 'bluebird';
import winston from 'winston';
import { pub, sub, store } from './redis/clients';

import 'babel-polyfill';

process.on('uncaughtException', function (err) {
	winston.info(`Uncaught exception occurred, but keeping process alive. Error: ${err} ${err.stack}`);
});

// Object managers.
roomManager.setStore(store);
userManager.setStore(store);

// Servers.
if (config.http.enabled) {
	for (const port of config.http.ports) {
		HttpChatServer.create(port);
	}
}
if (config.tcp.enabled) {
	for (const port of config.tcp.ports) {
		TcpChatServer.create(port);
	}
}
if (config.telnet.enabled) {
	for (const port of config.telnet.ports) {
		TelnetChatServer.create(port);
	}
}

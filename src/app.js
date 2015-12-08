
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
	winston.info(`Uncaught exception occurred, but keeping process alive. Error: ${err}`);
});

// Object managers.
roomManager.setStore(store);
userManager.setStore(store);

// Servers.
// TODO: Use pool of servers.
var httpServer = new HttpChatServer();
var tcpServer = new TcpChatServer();
var telnetServer = new TelnetChatServer();

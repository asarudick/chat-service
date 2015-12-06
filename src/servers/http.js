// var http = require('http').Server();
// var io = require('socket.io')(http);

import BaseChatServer from './base';
import config from '../config/app';
import winston from 'winston';
import io from 'socket.io';
import http from 'http';
import HttpChatClient from '../clients/http';

export default class HttpChatServer extends BaseChatServer {
	constructor () {
		super();

		var server = http.Server(); // eslint-disable-line

		var socketServer = io(http);

		socketServer.on('connection', (client) => {
			HttpChatClient.create(client);
		});

		server.listen(config.port, () => {
			super._onListen();
			winston.info(`HTTP Chat Server listening on port ${config.httpPort}`);
		});
	}
}

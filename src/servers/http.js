import BaseChatServer from './base';
import config from '../config/app';
import winston from 'winston';
import socketio from 'socket.io';
import http from 'http';
import HttpChatClient from '../clients/http';

export default class HttpChatServer extends BaseChatServer {
	
	constructor () {
		super();

		this._httpServer = http.Server(); // eslint-disable-line

		this._server = socketio(http);

		this._registerEvents();

		this._httpServer.listen(config.port, () => {
			super._onListen();
			// winston.info(`HTTP Chat Server listening on port ${config.httpPort}`);
		});
	}


	_registerEvents () {

		this._server.on('connection', (socket) => {
			var client = HttpChatClient.create(socket);
			this._onConnect(client);
		});

		this._server.on('listening', () => {
			winston.info(`HTTP Chat Server listening on port ${config.tcpPort}`);
		});

		// Occurs when user calls `.close()`(prevents any new connections) and all connections are closed.
		this._server.on('close', () => {
			winston.info('All connections closed.');
		});

		this._server.on('error', (error) => {
			winston.info(error);

			// `close()` automatically called when error occurs.
			winston.info('Closing server due to error.');
		});
	}
}

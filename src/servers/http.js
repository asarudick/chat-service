import BaseChatServer from './base';
import config from '../config/app';
import winston from 'winston';
import express from 'express';
import cors from 'cors';
import socketio from 'socket.io';
import http from 'http';
import HttpChatClient from '../clients/http';


export default class HttpChatServer extends BaseChatServer {

	constructor() {
		super();

		this._app = express();
		this._app.use(cors());

		this._httpServer = http.Server(this._app); // eslint-disable-line

		this._server = socketio(this._httpServer);

		this._registerEvents();

		this._httpServer.listen(config.httpPort, () => {
			super._onListen();
			winston.info(`HTTP Chat Server listening on port ${config.httpPort}`);
		});
	}


	_registerEvents() {

		this._server.on('checkContinue', () => {
			winston.info(`checkContinue fired.`);
		});
		this._server.on('request', () => {
			winston.info(`request fired.`);
		});
		this._server.on('upgrade', () => {
			winston.info(`upgrade fired.`);
		});
		this._server.on('connection', (socket) => {
			winston.info('HTTP Client connected.');
			var client = HttpChatClient.create(socket);
			this._onConnect(client);
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

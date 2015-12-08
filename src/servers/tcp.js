import net from 'net';
import BaseChatServer from './base';
import winston from 'winston';
import TcpChatClient from '../clients/tcp';
import config from '../config/app';

export default class TcpChatServer extends BaseChatServer {
	constructor () {
		super();

		this._server = net.createServer();
		this._registerEvents();
		this._server.listen(config.tcpPort);

	}

	_registerEvents () {

		this._server.on('connection', (socket) => {
			winston.info('TCP Client connected.');
			var client = TcpChatClient.create(socket);
			this._onConnect(client);
		});

		this._server.on('listening', () => {
			winston.info(`TCP Chat Server listening on port ${config.tcpPort}`);
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

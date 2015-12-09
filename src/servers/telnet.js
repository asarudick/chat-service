import telnet from 'telnet';
import BaseChatServer from './base';
import winston from 'winston';
import TelnetChatClient from '../clients/telnet';
import config from '../config/app';

export default class TelnetChatServer extends BaseChatServer {
	constructor (port) {
		super(port);

		this._server = telnet.createServer((client) => {
			winston.info('Telnet Client connected.');
			var client = TelnetChatClient.create(client);
			this._onConnect(client);
		});
		this._registerEvents.bind(this)();
		this._server.listen(this._port);

	}

	_registerEvents () {

		this._server.on('listening', () => {
			winston.info(`Telnet Chat Server listening on port ${this._port}`);
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

	static create (port) {
		return new TelnetChatServer(port);
	}
}

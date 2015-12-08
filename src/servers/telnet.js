import telnet from 'telnet';
import BaseChatServer from './base';
import winston from 'winston';
import TelnetChatClient from '../clients/telnet';
import config from '../config/app';

export default class TelnetChatServer extends BaseChatServer {
	constructor () {
		super();

		this._server = telnet.createServer((client) => {
			var client = TelnetChatClient.create(client);
			this._onConnect(client);
		});
		this._registerEvents();
		this._server.listen(config.telnetPort);

	}

	_registerEvents () {

		this._server.on('listening', () => {
			winston.info(`Telnet Chat Server listening on port ${config.telnetPort}`);
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

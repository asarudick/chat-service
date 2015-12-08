import net from 'net';
import BaseChatClient from './base';
import winston from 'winston';
import TcpBuffer from '../helpers/tcpBuffer';

export default class TelnetChatClient extends BaseChatClient {

	constructor (client) {

		super();

		this._client = client;
		this._buffer = new TcpBuffer();

		this._onConnect(this._client);
		this._registerEvents.bind(this)();

	}

	_onConnect (client) {

		// make unicode characters work properly
		client.do.transmit_binary();

		// make the client emit 'window size' events
		client.do.window_size();

		super._onConnect();
	}

	_writeLine (message) {
		this._client.write(message + '\r\n');
	}

	_registerEvents () {


		// listen for the window size events from the client
		this._client.on('window size', function (e) {
			if (e.command === 'sb') {
				winston.info(`telnet window resized to ${e.width} x ${e.height}`);
			}
		});

		this._buffer.on('line', this._onLine.bind(this));

		this._client.on('data', this._onData.bind(this));

		this._client.on('end', this._onDisconnect.bind(this));

		this._client.on('error', this._onError.bind(this));

	}

	_onLine (line) {
		super._onData(line);
	}

	_onData (data) {
		this._buffer.append(data);
	}

	_onDisconnect () {
		super._onDisconnect();
	}

	_onError (error) {
		if (error.code === 'ECONNRESET')
		{
			winston.info('Suppressing ECONNRESET error.');
			return;
		}
		super._onError(error);
	}

	async disconnect () {

		await super.disconnect();

		// Cleanup any listeners. Don't want them to call _writeLine() after the
		// client is disconnected.
		this._buffer.removeAllListeners();
		this._client.removeAllListeners('data');
		this._client.end();
		this._client.removeAllListeners('error');
	}

	static create (client) {
		return new TelnetChatClient(client);
	}
}

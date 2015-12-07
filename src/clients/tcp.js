import net from 'net';
import BaseChatClient from './base';
import winston from 'winston';
import TcpBuffer from '../helpers/tcpBuffer';

export default class TcpChatClient extends BaseChatClient {

	constructor (socket) {

		super();

		this.socket = socket;
		this._buffer = new TcpBuffer();

		this._registerEvents.bind(this)();

		super._onConnect();

		// winston.info(`eventHandlers.line: ${this.eventHandlers.line}`);
	}

	_onConnect () {
		super._onConnect();
		var address = this.socket.address();
		winston.info(`Client connected via TCP: address => ${address.address}, port => ${address.port}, family => ${address.family}`);
	}

	_writeLine (message) {
		this.socket.write(message + '\r\n');
	}

	_registerEvents () {

		this._buffer.on('line', this._onLine.bind(this));

		this.socket.on('data', this._onData.bind(this));

		this.socket.on('end', this._onDisconnect.bind(this));

		this.socket.on('error', this._onError.bind(this));

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
		super._onError(error);
	}

	async disconnect () {

		await super.disconnect();
		this._buffer.removeAllListeners();
		this.socket.removeAllListeners('data');
		this.socket.end();
		this.socket.removeAllListeners('error');
	}

	static create (socket) {
		return new TcpChatClient(socket);
	}
}

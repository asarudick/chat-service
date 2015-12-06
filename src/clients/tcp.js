import net from 'net';
import BaseChatClient from './base';
import winston from 'winston';
import TcpBuffer from '../helpers/tcpBuffer';

export default class TcpChatClient extends BaseChatClient {

	constructor (socket) {

		super();

		this.socket = socket;
		this.buffer = new TcpBuffer();

		this._registerEvents();

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
		
		this.eventHandlers = {
			line: this._onLine.bind(this),
			data: this._onData.bind(this),
			error: this._onError.bind(this)
		};

		this.buffer.on('line', this.eventHandlers.line);

		this.socket.on('data', this.eventHandlers.data);

		this.socket.once('end', this._onDisconnect);

		this.socket.on('error', this.eventHandlers.error);

	}

	_onLine (line) {
		super._onData(line);
	}

	_onData (data) {
		this.buffer.append(data);
	}

	_onDisconnect () {
		super._onDisconnect();
	}

	_onError (error) {
		super._onError(error);
	}

	async disconnect () {
		await super.disconnect();
		this.socket.end();
		this.buffer.removeListener('line', this.eventHandlers.line);
		this.socket.removeListener('data', this.eventHandlers.data);
		this.socket.removeListener('error', this.eventHandlers.error);
	}

	static create (socket) {
		return new TcpChatClient(socket);
	}
}

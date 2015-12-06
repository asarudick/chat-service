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

		this.buffer.on('line', (line) => {
			super._onData(line);
		});

		this.socket.on('data', (data) => {
			this.buffer.append(data);
		});

		this.socket.on('end', () => {
			this._onDisconnect();
		});

		this.socket.on('error', (error) => {
			super._onError(error);
		});

	}

	_onDisconnect () {
		super._onDisconnect();
		this.socket.removeListener('end');
	}

	async disconnect () {
		await super.disconnect();
		this.socket.end();
		this.buffer.removeListener('line');
		this.socket.removeListener('data error');
	}

	static create (socket) {
		return new TcpChatClient(socket);
	}
}

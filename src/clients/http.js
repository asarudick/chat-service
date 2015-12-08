import net from 'net';
import Command from '../commands/command';
import commands from '../commands/index';
import BaseChatClient from './base';
import winston from 'winston';

export default class HttpChatClient extends BaseChatClient {

	// TODO: Introduce scoped variables to reduce number of chain lookups by interpreter.
	constructor (client) {
		super();

		this._client = client;
		super._onConnect();

		this._registerEvents();
	}

	_writeLine (message) {
		this._client.emit('chat.data', message);
	}

	_registerEvents () {
		this._client.on('chat.data', (data) => {
			super._onData(data);
		});
		this._client.on('disconnect', () => {
			super._onDisconnect();
		});
		this._client.on('error', (error) => {
			super._onError(error);
		});

	}

	static create (client) {
		return new HttpChatClient(client);
	}
}

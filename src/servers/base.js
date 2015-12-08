import net from 'net';
import commands from '../commands/index';
import config from '../config/app';
import roomManager from '../managers/room';
import { pub, sub, store } from '../redis/clients';
import EventEmitter from 'events';
import winston from 'winston';
import 'babel-polyfill';

export default class BaseChatServer extends EventEmitter {
	constructor () {
		super();
		this.clients = {};
		// Handle any messages coming from the global redis sub client.
		sub.on('message', this._onMessage.bind(this));

	}

	_onConnect (client) {
		client.on('login', (user) => {
			this.clients[client.user.id] = client;
		});
	}

	_onMessage (channel, message) {

		var that = this;
		var room = channel;
		var msg = JSON.parse(message);

		// TODO: Handle private messaging. Add reserved conversation channel?
		// Dispatch messages to all clients in the rooms.
		roomManager.getAllUserIds(room).then( (userIds) => {

			for (var i = 0, length = userIds.length; i < length; i++) {

				var client = that.clients[userIds[i]];

				if (client) {
					client.emit('room.' + msg.type, msg);
				}
			}
		})
		.catch((error) => winston.error(error));
	}

	_onListen () {

	}

	_onClose () {
		winston.info(`Server shutting down.`);
	}

	_onError (error) {
		winston.error(error);
	}
}

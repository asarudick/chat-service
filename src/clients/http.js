import net from 'net';
import Command from '../commands/command';
import commands from '../commands/index';
import BaseChatClient from './base';
import winston from 'winston';

export default class HttpChatClient extends BaseChatClient {

	constructor(client) {
		super();

		this._client = client;
		super._onConnect();

		this._registerEvents();
	}

	_writeLine(message) {
		this._client.emit('chat.data', message);
	}

	_registerEvents() {
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

	/**
	 * Handles any message from the current room.
	 * @method _onRoomMessage
	 * @param  {Object}          message The message sent in the room.
	 */
	_onRoomMessage(message) {

		// Filter out any messages from this user.
		if (message.name === this.user.name) {
			return;
		}

		this._client.emit('room.message', message);
	}

	/**
	 * Handles any room notification.
	 * @method _onNotificationMessage
	 * @param  {Object}               message The notification message.
	 */
	// TODO: Use an object to map notifcation types with their respective handler.
	// TODO: Refactor me.
	_onNotificationMessage(message) {
		if (message.notificationType === 'userJoin') {
			if (message.user !== this.user.name) {
				this._client.emit('room.notification', {text: ` * a new user joined ${this.user.room}: ${message.user}`, type: message.notificationType });
			}
		} else if (message.notificationType === 'userLeave') {
			if (message.user === this.user.name) {
				this._client.emit('room.notification', {text: ` * user has left ${this.user.room}: ${message.user} (** this is you)`, type: message.notificationType });
			}
			this._client.emit('room.notification', {text:` * user has left ${this.user.room}: ${message.user} (** this is you)`, type: message.notificationType });
		}
	}

	static create(client) {
		return new HttpChatClient(client);
	}

	async disconnect() {
		await super.disconnect();
		this._client.disconnect();
		this._client.removeAllListeners();
	}
}

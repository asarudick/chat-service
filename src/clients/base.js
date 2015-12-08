import net from 'net';
import commands from '../commands/index';
import winston from 'winston';
import uuid from 'node-uuid';
import Command from '../commands/command';
import Prompt from '../prompts/base';
import LoginPrompt from '../prompts/login';
import EventEmitter from 'events';
import { pub, sub, store } from '../redis/clients';
import roomManager from '../managers/room';
import userManager from '../managers/user';

const messages = {
	welcome: 'Welcome to the chat server.',
	commandDoesNotExist: 'Command does not exist.'
};


export default class BaseChatClient extends EventEmitter {

	/**
	 * @constructor
	 */
	constructor () {
		super();
		this.user = { id: uuid.v4(), name: null, room: null };
	}

	/**
	 * Event handler for when a user disconnects.
	 * @method _onDisconnect
	 */
	_onDisconnect () {
		winston.info(`Client ${this.user.id} disconnected.`);
		this.removeAllListeners();

		roomManager.removeUserFromAll(this.user);
		userManager.remove(this.user);
		this.prompt = null;
	}

	/**
	 * Event handler for when a user connects.
	 * @method _onConnect
	 */
	_onConnect () {

		this._writeLine(messages.welcome);

		this._requestLogin();

		this.on('room.message', this._onRoomMessage.bind(this));
		this.on('room.notification', this._onNotificationMessage.bind(this));

	}

	/**
	 * Handles any message from the current room.
	 * @method _onRoomMessage
	 * @param  {Object}          message The message sent in the room.
	 */
	_onRoomMessage (message) {

		// Filter out any messages from this user.
		if (message.name === this.user.name)
		{
			return;
		}

		this._writeLine(`${message.user}: ${message.text}`);
	}

	/**
	 * Handles any room notification.
	 * @method _onNotificationMessage
	 * @param  {Object}               message The notification message.
	 */
	// TODO: Use an object to map notifcation types with their respective handler.
	_onNotificationMessage (message) {
		if (message.notificationType === 'userJoin' )
		{
			if (message.user !== this.user.name)
			{
				this._writeLine(` * a new user joined ${this.user.room}: ${message.user}`);
			}
		}
		else if (message.notificationType === 'userLeave' )
		{
			if (message.user === this.user.name)
			{
				this._writeLine(` * user has left ${this.user.room}: ${message.user} (** this is you)`);
			}
			this._writeLine(` * user has left ${this.user.room}: ${message.user}`);
		}
	}

	/**
	 * Wraps login related functionality.
	 * @method _requestLogin
	 */
	_requestLogin () {
		// Create.
		var loginPrompt = new LoginPrompt();

		// Subscribe.
		loginPrompt.on('login', (name) => {
			this.user.name = name;
			this.emit('login', this.user);
		});

		// Start.
		this._startPrompt( loginPrompt );
	}

	/**
	 * Event handler for when the user submits data.
	 * @method _onData
	 * @param  {bytearray} data The data sent via the user.
	 */
	async _onData (data) {

		// Strip whitespace/line terminators.
		data = data.toString().trim();

		winston.info(`Received from ${this.user.id}: ${data}`);

		// Should already be started at this point.
		if ( this.prompt )
		{
			await this._runPrompt(data);

			return;
		}

		var parseResult;

		// Parse into a command.
		try {
			parseResult = Command.parse(data);
		}
		catch (ex) {
			this._writeLine(ex.message);
		}

		if (parseResult)
		{
			// Find the command. NOTE: Case-insensitive.
			var command = commands[parseResult.command] || commands[parseResult.command.toLowerCase()] || commands[parseResult.command.toUpperCase()];

			// We found a command. Execute using provided parameters and print the result.
			if (command)
			{
				var message;

				try {
					message = await command.execute(parseResult.params, this);
				} catch (e) {
					if (e.name === 'CommandError')
					{
						this._writeLine(e.message);
					}
					else {
						winston.error(e);
					}
				}

				if (message)
				{
					this._writeLine(message);
				}

				return;
			}

			// Inform the user that we couldn't find the specified command.
			this._writeLine(messages.commandDoesNotExist);

			return;
		}

		// Otherwise, it's a message from the user to the channel.
		if (this.user.room)
		{
			var msg = { type: 'message', user: this.user.name, text: data };
			pub.publish(this.user.room, JSON.stringify(msg));
		}

	}

	/**
	 * Event handler for when the connection encounters an error.
	 * @method _onError
	 */
	_onError (error) {
		winston.error(error);
	}

	/**
	 * Pseudo virtual method for subclasses to implement.
	 * @method _writeLine
	 */
	_writeLine (message) {
		throw new Error('Not implemented');
	}

	/**
	 * Wrapper for starting a prompt.
	 * @method _startPrompt
	 * @param  {prompt}     prompt The prompt to bind to the current client session and start.
	 */
	_startPrompt (prompt) {

		this.prompt = prompt;

		var res = this.prompt.start();

		res.then((result) => {
				this._writeLine(result);
			})
			.catch((error) => {
				winston.info(error);
			});
	}

	/**
	 * Feeds user input into the current prompt and evaluates it. Upon success,
	 * the prompt is 'promptly' deleted.
	 * @method _runPrompt
	 * @param  {string}   data The text from the user to evaluate.
	 */
	async _runPrompt (data) {

		var result;

		// Send the prompt whatever the user sent, and get the result.
		try {
			result = (await this.prompt.executor.next( data )).value;
		}
		catch (e)
		{
			winston.error(e);
		}

		// Write out the result of evaluating the user input.
		this._writeLine(result.message);

		// If the prompt is successfully completed, remove it.
		if (result.success)
		{
			this.prompt = null;
		}
	}

	/**
	 * Subclasses implement the actual disconnection. This will just do anything
	 * necessary prior to disconnection regardless of client type.
	 * @method disconnect
	 */
	async disconnect () {
		await this._writeLine('BYE');
	}
}

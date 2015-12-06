import CommandError from '../errors/command';

const MAX_COMMAND_NAME_LENGTH = 20;
const MAX_COMMAND_LENGTH = 128;

export default class Command {
	constructor (cb, usage) {
		this._cb = cb || function () {};
		this.usage = usage || 'Not implemented';
	}
	async execute () {
		var args = Array.prototype.slice.call(arguments); // eslint-disable-line

		var result;

		try {
			result = this._cb.apply(null, args); // eslint-disable-line
		}
		catch (ex)
		{
			throw new CommandError(`${ex.message} \r\nUsage: ${this.usage}`);
		}

		return result;
	}

	static parse (data) {

		// If it doesn't start with /, it is not a command.
		if (data[0] !== '/')
		{
			return null;
		}

		// Ignore/throw error if the command is too damn long.
		if (data.length > MAX_COMMAND_LENGTH)
		{
			throw new CommandError(`Command too long. (Limit is ${MAX_COMMAND_LENGTH} characters)`);
		}

		var tokens = data.split(' ');

		return {
			command: tokens[0].substring(1),
			params: Array.prototype.splice.call(tokens, 1) // eslint-disable-line
		};

	}
}

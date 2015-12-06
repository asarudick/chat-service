export default class CommandError extends Error {
	constructor (message)
	{
		super(message);
		this.message = message;
		this.stack = (new Error()).stack;
		this.name = 'CommandError';
	}
}

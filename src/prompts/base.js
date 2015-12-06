import winston from 'winston';
import PromptError from '../errors/prompt';
import EventEmitter from 'events';

export default class Prompt extends EventEmitter {

	// Prompts must at least have one step.
	constructor (step) {
		super();
		// Maintains info between steps.
		this._state = {};
		this._steps = [];
		this.executor = null;
	}

	addStep (step)
	{
		this._steps.push(step);
	}

	async start ()
	{
		// Get our Iterator object.
		this.executor = this.evaluate();

		// Grab the prompt message.
		var result = (await this.executor.next()).value;

		// Proceed to the next yield keyword where we wait for user input.
		await this.executor.next();

		return result.message;
	}

	*evaluate ()
	{
		for (const step of this._steps) {

			// Defer control to step's generator.
			yield* step();
		}
		return;
	}

	static createStep ({start = null, evaluate = null}) {
		return async function* stepGenerator () {
			var state = {};

			// Pause after displaying some prompt message (Nominal use case)
			// Returns a string.
			var startMessage = start(state);

			yield { success: false, message: startMessage };

			var result;
			var error;

			// Repeatedly evaluate until the user successfully enters in something acceptable.
			while (!result) {

				// Wait for a response to be handed back.
				var response = yield error;

				try {
					result = await evaluate(state, response);
				}
				catch (e)
				{
					// instanceof operator and constructor property aren't reliable since somewhere
					// the errors are rethrown in the async/await implementation.
					if (e.name === 'PromptError')
					{
						error = { success: false, message: e.message };
					}
					else {
						throw e;
					}
				}

			}

			return { success: true, message: result };
		};
	}

}

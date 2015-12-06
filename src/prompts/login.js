import Prompt from './base';
import userManager from '../managers/user';
import winston from 'winston';
import PromptError from '../errors/prompt';

export default class LoginPrompt extends Prompt {
	constructor () {

		super();

		var that = this;

		this.addStep( Prompt.createStep( {
			start: (state) => {

				// No need for a prompt message according to the requirements.
				return 'Login Name?';
			},
			evaluate: async function (state, name) {

					if (!name)
					{
						throw new PromptError('Can\'t login without a name.');
					}

					var nameExists = await userManager.nameExists(name);

					if (nameExists)
					{
						throw new PromptError('Sorry, name taken.');
					}

					var added = await userManager.add(name);
					var id = await userManager.getUserId(name);

					that.emit('login', name);

					return `Welcome ${name}!`;
			}
		}));
	}
}

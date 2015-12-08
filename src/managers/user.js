import Manager from './base';
import winston from 'winston';
import uuid from 'node-uuid';

class UserManager extends Manager {

	add (name) {
		return this.store.setnxAsync(`user.name:${name}`, 1);
	}

	remove (user) {
		return this.store.delAsync(`user.name:${user.name}`);
	}

	nameExists (name) {
		return this.store.existsAsync(`user.name:${name}`);
	}

};

const userManager = new UserManager();

export default userManager;

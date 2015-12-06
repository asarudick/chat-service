import Manager from './base';
import winston from 'winston';
import uuid from 'node-uuid';

class UserManager extends Manager {

	add (user) {
		return this.store
				.multi()
					.setnx(`user.name:${user.id}`, user.name)
					.setnx(`user.id:${user.name}`, user.id)
				.execAsync();
	}

	remove (user) {
		return this.store
				.multi()
					.del(`user.name:${user.id}`)
					.del(`user.id:${user.name}`)
				.execAsync();
	}

	nameExists (name) {
		return this.store.existsAsync(`user.id:${name}`);
	}

	getUserId (name) {
		return this.store.getAsync(`user.id:${name}`);
	}

	getUserName (id) {
		return this.store.getAsync(`user.name:${id}`);
	}

};

const userManager = new UserManager();

export default userManager;

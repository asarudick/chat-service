export default class Manager {
	setStore (store) {
		if (!store) {
			throw new Error('store parameter is not defined, and is required.');
		}

		this.store = store;
	}
}

import Manager from './base';
import winston from 'winston';
import userManager from './user';
import { pub, sub, store } from '../redis/clients';
import 'babel-polyfill';

class RoomManager extends Manager {

	add (room) {
		var result = this.store
			.multi()
				.sadd('rooms', room)
			.execAsync();

		if (result) {
			sub.subscribe(`${room}`);
		}

		return result;
	}

	remove (room) {
		var result = this.store
			.multi()
				.del(`room:${room}`)
				.srem('rooms', room)
			.execAsync();

		if (result) {
			sub.unsubscribe(`${room}`);
		}

		return result;
	}

	exists (room) {
		return this.store.existsAsync(`room:${room}`);
	}

	getAllNames () {
		return this.store.smembersAsync(`rooms`);
	}

	getAllUsers (room) {
		return this.store.smembersAsync(`room.members.names:${room}`);
	}

	getAllUserIds (room) {
		return this.store.smembersAsync(`room.members:${room}`);
	}

	getUserCount (room) {
		return this.store.hgetAsync(`room:${room}`, 'userCount');
	}

	async addUser (room, user) {

		var result = {};

		await this.add(room);

		[ result.userAddedToRoom, result.roomAddedToUserRooms, result.userNameAddedToRoomNames ] = await this.store
			.multi()
				.sadd(`room.members:${room}`, user.id)
				.sadd(`user.rooms:${user.id}`, room)
				.sadd(`room.members.names:${room}`, user.name)
			.execAsync();

		if (result.userAddedToRoom)
		{
			result.userCount = await this.store.hincrbyAsync(`room:${room}`, 'userCount', 1);
			pub.publish(`${room}`, JSON.stringify({ type: 'notification', notificationType: 'userJoin', user: user.name }));
		}

		user.room = room;
		return result;
	}

	async removeUser (room, user) {

		var result = {};

		[ result.userRemovedFromRoom, result.roomRemovedFromUserRooms, result.userNameRemovedFromRoomNames ] = await this.store
			.multi()
				.srem(`room.members:${room}`, user.id)
				.srem(`user.rooms:${user.id}`, room)
				.srem(`room.members.names:${room}`, user.name)
			.execAsync();

		if (result.userRemovedFromRoom)
		{
			result.userCount = await this.store.hincrbyAsync(`room:${room}`, 'userCount', -1);
			pub.publish(`${room}`, JSON.stringify({ type: 'notification', notificationType: 'userLeave', user: user.name }));
		}

		return result;
	}

	userExists (room, user) {
		return this.store.sismemberAsync(`room.members:${room}`, user.id);
	}

	async removeUserFromAll (user) {
		var rooms = await this.store.smembersAsync(`user.rooms:${user.id}`);

		for (var i = 0, length = rooms.length; i < length; i++)
		{
			await this.removeUser(rooms[i], user);
		}

		return true;
	}
};

const roomManager = new RoomManager();

export default roomManager;

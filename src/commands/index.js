import roomManager from '../managers/room';
import userManager from '../managers/user';
import Command from './command';
import Promise from 'bluebird';
import CommandError from '../errors/command';
import winston from 'winston';
import _ from 'lodash';

const commands = {};

commands.join = new Command (
	async function ([ room ], client) {

		var user = client.user;

		if (!room) {
			throw new CommandError('Room not specified.');
		}

		var result = await roomManager.addUser(room, user);

		if (!result.userAddedToRoom) {
			throw new CommandError(`You're already in room: ${room}`);
		}

		var roomUsers = await roomManager.getAllUsers(room);

		// Using lodash's implementation since it is thoroughly more performant
		// since it punts on the edge cases.
		var userList = _.map(roomUsers, (userName) => {

			var str = `* ${userName}`;

			if (userName === user.name)
			{
				str += ' (** this is you)';
			}

			return str;

		}).join('\r\n');

		userList += '\r\nend of list.';

		user.room = room;

		return `entering room: ${room}\r\n` + userList;
	},

	'/join <room>'
);

commands.leave = new Command (
	async function ([], client) {

		if (!client.user.room)
		{
			throw new CommandError(`You aren't in a room!`);
		}

		var user = client.user;

		var result = await roomManager.removeUser(client.user.room, user);

		if (!result.userRemovedFromRoom) {
			throw new CommandError(`You weren\'t in the ${client.user.room} room!`);
		}

		var message = `You\'ve left the ${client.user.room} room!`;

		client.user.room = null;

		return message;
	}
);

commands.leaveAll = new Command (
	async function ([], client) {
		var user = client.user;
		if (await roomManager.removeUserFromAll(user)) {
			return 'You\'ve left all rooms';
		}
	}
);

commands.rooms = new Command (
	async function ([], client) {

		var user = client.user;

		var roomNames = await roomManager.getAllNames();

		var roomList = '';

		for (var i = 0, length = roomNames.length; i < length; i++) {
			var count = await roomManager.getUserCount(roomNames[i]);
			roomList += `\r\n * ${roomNames[i]} (${count})`;
		}

		return roomList.length ? 'Active rooms:' + roomList + '\r\nend of list.' : 'There are currently no rooms! Make one with /join <room>.';
	}
);

commands.quit = new Command (
	function ([], client) {
		client.disconnect();
	}
);

export default commands;

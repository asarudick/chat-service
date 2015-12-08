'use strict';

$(function () {
	var socket = io('http://52.70.145.9:3001');
	var textInput = $('#m');
	var messages = $('messages');

	$('form').submit(function () {
		socket.emit('data', textInput.val());
		textInput.val('');
		return false;
	});

	socket.on('data', function (msg) {
		messages.append($('<li>').text(msg));
	});
});

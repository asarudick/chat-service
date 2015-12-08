'use strict';

$(function () {
	var socket = io('http://52.70.145.9:3001');
	var textInput = $('#m');

	$('form').submit(function () {
		socket.emit('data', textInput.val());
		textInput.val('');
		return false;
	});
});

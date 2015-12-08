'use strict';

$(function () {
	var socket = io();
	var textInput = $('#m');

	$('form').submit(function () {
		socket.emit('data', textInput.val());
		textInput.val('');
		return false;
	});
});

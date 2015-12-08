'use strict';

$(function () {
	Handlebars.registerHelper('breaklines', function (text) {
		text = Handlebars.Utils.escapeExpression(text);
		text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
		return new Handlebars.SafeString(text);
	});

	var source = $("#message-template").html();
	var template = Handlebars.compile(source);

	var socket = io('http://localhost:3001');
	// var socket = io('http://52.70.145.9:3001');
	var textInput = $('#m');
	var messages = $('#messages');

	$('form').submit(function () {
		socket.emit('chat.data', textInput.val());
		textInput.val('');
		return false;
	});

	socket.on('chat.data', function (msg) {
		messages.append(template({message: msg}));
	});
});

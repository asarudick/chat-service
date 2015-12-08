'use strict';

$(function () {
	Handlebars.registerHelper('breaklines', function (text) {
		text = Handlebars.Utils.escapeExpression(text);
		text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
		return new Handlebars.SafeString(text);
	});

	var source = $("#message-template").html();
	var template = Handlebars.compile(source);

	var textInput = $('#m');
	var messages = $('#messages');
	var scrollBody = $('html, body');
	var hostModal = $('#hostModal');

	function writeLine(message) {
		messages.append(template({
			'message': message
		}));

		scrollBody.animate({
				scrollTop: $(document).height() - $(window).height()
			},
			200
		);
	};

	function startChat(host) {
		var socket = io(host);

		socket.on('chat.data', function (msg) {
			writeLine(msg);
		});

		socket.on('disconnect', function () {
			writeLine('You have been disconnected.');
		});
		socket.on('error', function (error) {
			writeLine('Connection error: ' + error);
		});
		socket.on('connect', function () {
			writeLine('You have connected to the chat service.');
		});
		socket.on('reconnecting', function (attempt) {
			writeLine('Attempting to reconnect. Attempt #' + attempt);
		});
		socket.on('reconnect', function (attempt) {
			writeLine('Reconnected after ' + attempt + ' attempts.');
		});
		socket.on('reconnect_error', function (error) {
			writeLine('Reconnect error: ' + error);
		});
		socket.on('reconnect_failed', function () {
			writeLine('Unable to reconnect.');
		});

		$('form').submit(function () {
			socket.emit('chat.data', textInput.val());
			textInput.val('');
			return false;
		});
	}



	hostModal.on('hidden.bs.modal', function () {
		var host = $('#host').val();
		if (host.search(/^https?/) === -1)
		{
			host = 'http://' + host;
		}
		startChat(host);
	});

	hostModal.modal();
});

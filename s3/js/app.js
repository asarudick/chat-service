'use strict';

$(function () {
	var md = new Remarkable({
		html: false, // Enable HTML tags in source
		xhtmlOut: false, // Use '/' to close single tags (<br />)
		breaks: false, // Convert '\n' in paragraphs into <br>
		langPrefix: 'language-', // CSS language prefix for fenced blocks
		linkify: true, // Autoconvert URL-like text to links

		// Enable some language-neutral replacement + quotes beautification
		typographer: false,

		// Double + single quotes replacement pairs, when typographer enabled,
		// and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
		quotes: '“”‘’',

		// Highlighter function. Should return escaped HTML,
		// or '' if the source string is not changed
		highlight: function () {
			return '';
		}
	});

	var emoji = window.emojiParser;

	Handlebars.registerHelper('markdownAndEmojis', function (text) {
		var markdownResult = md.render(text);

		// Strip the <p> element that wraps around it.
		var strippedResult = markdownResult.replace(/^<p>|<\/p>$|<p><\/p>/gm, '');
		var emojiResult = emoji(strippedResult, 'bower_components/emoji-parser/emoji');
		return emojiResult;
	});

	Handlebars.registerHelper('breaklines', function (text) {
		text = Handlebars.Utils.escapeExpression(text);
		text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
		return new Handlebars.SafeString(text);
	});

	var chatMessageSource = $("#chat-message-template").html();
	var roomMessageSource = $("#room-message-template").html();
	var roomNotificationSource = $("#room-notification-template").html();

	var chatMessageTemplate = Handlebars.compile(chatMessageSource);
	var roomMessageTemplate = Handlebars.compile(roomMessageSource);
	var roomNotificationTemplate = Handlebars.compile(roomNotificationSource);

	var textInput = $('#m');
	var messages = $('#messages');
	var scrollBody = $('html, body');
	var hostModal = $('#hostModal');

	function scrollToBottom() {
		scrollBody.animate({
				scrollTop: $(document).height() - $(window).height()
			},
			200
		);
	}

	function writeLine(message) {
		messages.append(chatMessageTemplate({
			'message': message
		}));

		scrollToBottom();
	};

	function writeRoomMessage(message) {
		messages.append(roomMessageTemplate({
			'message': message
		}));

		scrollToBottom();
	};

	function writeRoomNotification(message) {
		messages.append(roomNotificationTemplate({
			'message': message
		}));

		scrollToBottom();
	};

	function startChat(host) {
		var socket = io(host);

		socket.on('chat.data', function (msg) {
			writeLine(msg);
		});
		socket.on('room.message', function (msg) {
			writeRoomMessage(msg);
		});
		socket.on('room.notification', function (msg) {
			writeRoomNotification(msg);
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
		if (host.search(/^https?/) === -1) {
			host = 'http://' + host;
		}
		startChat(host);
	});

	hostModal.modal();
});

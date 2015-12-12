import winston from 'winston';
import EventEmitter from 'events';
import _ from 'lodash';

export default class TcpBuffer extends EventEmitter {

	constructor () {
		super();
		this.buffer = '';
		this.lines = [];
	}

	append (data) {
		this.buffer += data.toString();
		this._emitLines();
	}

	_emitLines () {
		var lines = this.lines;

		lines = this.buffer.split(/[\r\n]+/g);

		var lastLine = lines[lines.length - 1];

		_.forEach( lines.slice( 0, lines.length - 1 ), (line) => {
			this.emit('line', line.trim());
		});

		this.lines = [];

		this.buffer = lastLine;
	}
};

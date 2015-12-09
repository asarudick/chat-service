# Prerequisites

- node v0.12.x
- npm
- git
- bower
- Access to a Redis node. (Installing Redis and running `redis-server` would be sufficient.)

# Build

## Service
```
$ git clone https://github.com/Shabonkerz/chat-service.git
$ npm install
$ npm install -g gulp
$ gulp js
```

## Web Client
If you don't have bower, run this first:

```
$ npm install -g bower
```
Then:

```
$ bower install
```

# Configuration

Edit port configuration and Redis configuration in `/config/app.js`.

###### Note:

`REDIS_URL` environment variable will override the host/port configuration.

# Run

```
$ node ./dist/app
```


# Usage
## Connecting
Running `node ./dist/app` will start an HTTP server using socket.io, a raw TCP server, and a telnet server on the configured ports. To connect, open a raw tcp connection, or telnet connection(I recommend puttytel for both), or open `/s3/index.html` in a browser to connect via http.

## Login
Upon connecting you'll be asked to log in. Simply type a name that isn't in use.

## Commands
Available commands include:

- `/join <room>` - Joins specified room. You can only be in multiple rooms, but, for now, chat messages get sent to the most recently joined room.
- `/rooms` - Lists all available rooms with their headcount.
- `/leave` - Leaves current room.
- `/quit` - Disconnects you from the server. Also logs you out beforehand.

## Emoticons
Emoticons are provided using emoji-parser. It supports the basic fare of emoticons such as:

`:smiley:`
`:+1:`
`:-1:`
`:pizza:`

...and many more. See the `/s3/bower_components/emoji-parser/emoji` directory for a complete list. The filename correlates with the emoticon text. eg. `:smiley:` turns into `smiley.png`;

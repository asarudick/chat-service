# Prerequisites

- node
- git
- Access to a Redis node.

# Build

```
$ git clone https://github.com/Shabonkerz/chat-service.git
$ npm install
$ gulp js
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

Running `node ./dist/app` will start an HTTP server using socket.io, a raw TCP server, and a telnet server on the configured ports. To connect, open a raw tcp connection, or telnet connection(I recommend puttytel for both), or open `/s3/index.html` in a browser to connect via http.

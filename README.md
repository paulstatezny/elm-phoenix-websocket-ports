# Elm Phoenix Websocket Ports [![Build Status](https://travis-ci.org/knledg/elm-phoenix-websocket-ports.svg?branch=master)](https://travis-ci.org/knledg/elm-phoenix-websocket-ports)

Communicate with a [Phoenix Framework](http://www.phoenixframework.org/) application via Websocket.

## Quick Start

### 1. Install via NPM

```
$ npm install --save elm-phoenix-websocket-ports
```

### 2. In `elm-package.json`, import [`Ports/Websocket.elm`](lib/elm/Ports/Websocket.elm)

Add `node_modules/elm-phoenix-websocket-ports/lib/elm` to your `source-directories`:

```js
// elm-package.json

{
    // ...

    "source-directories": [
        "../../node_modules/elm-phoenix-websocket-ports/lib/elm", // Exact path to node_modules may be different for you
        "./"
    ],

    // ...
}
```

### 3. Use it in your Elm code

```elm
-- TODO: Add example here
```

### 4. Register your Elm app in JavaScript

#### Using [Elm Router](https://github.com/knledg/elm-router)

```javascript
var phoenix = require('phoenix');
var socketAddress = '/socket';

var websocketPorts = require('elm-phoenix-websocket-ports')(phoenix, socketAddress);
elmRouter.start(Elm, [websocketPorts]);
```

#### Without Elm Router

```javascript
var phoenix = require('phoenix');
var socketAddress = 'ws://website.com/ws';
var websocketPorts = require('elm-phoenix-websocket-ports')(phoenix, socketAddress);

var myElmApp = Elm.MyElmApp.embed(document.getElementById('my-elm-app-container'));

websocketPorts.register(myElmApp.ports);
```

#### Factory Function API

Notice that the module itself is a factory function with this signature:

```
function websocketPorts(phoenix, socketAddress)
```

##### `phoenix`

This is the [Phoenix Framework JavaScript client](https://www.npmjs.com/package/phoenix). Instead of making Phoenix a dependency of this NPM module, we require it to be injected.

We do this to avoid bloating your bundle by double-importing the Phoenix client, since `mix phoenix.new` sets up `package.json` to import the Phoenix JavaScript client from a relative path in the code repository.

##### `socketAddress`

This is the path to your socket endpoint. It can be a relative or absolute path. For example:

```
/ws
ws://example.com/socket
wss://www.mysite.com/socket_endpoint
```

## API Reference

[View the full API reference here.](./API.md)

## Questions or Problems?

Feel free to create an issue in the [GitHub issue tracker](https://github.com/knledg/elm-phoenix-websocket-ports/issues).

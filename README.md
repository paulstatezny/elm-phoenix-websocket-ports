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
var websocketPorts = require('elm-phoenix-websocket-ports');
elmRouter.start(Elm, [websocketPorts]);
```

#### Without Elm Router

```javascript
var websocketPorts = require("elm-phoenix-websocket-ports");
var myElmApp = Elm.MyElmApp.embed(document.getElementById("my-elm-app-container"));

websocketPorts.register(myElmApp.ports);
```

## API Reference

[View the full API reference here.](./API.md)

## Questions or Problems?

Feel free to create an issue in the [GitHub issue tracker](https://github.com/knledg/elm-phoenix-websocket-ports/issues).

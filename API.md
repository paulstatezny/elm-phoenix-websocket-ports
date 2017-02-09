# API Reference

The full API reference for Elm Phoenix Websocket Ports.

## Type Aliases

```elm
type alias Payload = Json.Encode.Value
type alias Topic = String
type alias Event = String
```

# Commands

## websocketSend

```elm
port websocketSend : (Topic, Event, Payload) -> Cmd msg
```

```elm
Ports.Websocket.websocketSend
  ( "search"
  , "request_results"
  , Json.Encode.object [("page", Json.Encode.int 3)]
  )
```

## websocketListen

```elm
port websocketListen : (Topic, Event) -> Cmd msg
```

```elm
Ports.Websocket.websocketListen ("search", "receive_results")
```

### Notes

`websocketListen` is typically used in `init`, to begin listening when an app is initialized.

# Subscriptions

## websocketReceive

```elm
port websocketReceive : ((Topic, Event, Payload) -> msg) -> Sub msg
```

```elm
type Msg
  = WebsocketReceive (String, String, Json.Decode.Value)


subscriptions model =
  Ports.Websocket.websocketReceive WebsocketReceive


update msg model =
  case msg of
    WebsocketReceive ("someTopic", "someEvent", payload) ->
      case Json.Decode.decodeValue someDecoder payload of
        Ok payload_ ->
          -- Do something with payload_
```

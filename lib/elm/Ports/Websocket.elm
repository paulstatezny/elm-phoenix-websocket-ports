port module Ports.Websocket exposing (..)


import Json.Encode


type alias Payload = Json.Encode.Value
type alias Topic = String
type alias Event = String


-- Receive from JS (Sub)
port websocketReceive : ((Topic, Event, Payload) -> msg) -> Sub msg


-- Send to JS (Cmd)
port websocketSend : (Topic, Event, Payload) -> Cmd msg
port websocketListen : (Topic, Event) -> Cmd msg

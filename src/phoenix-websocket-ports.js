module.exports = portsFactory;

/**
 * Create a websocket ports object.
 *
 * @param {Object}   phoenix        The Phoenix JavaScript bundle. (Used to access the Socket constructor.)
 * @param {String}   endpoint       The URL of the socket endpoint. ("/socket" by default in Phoenix.)
 * @param {Object}   options        (Optional) A set of options to pass to the Socket contructor.
 *                                  These aren't documented outside the code, but inspecting the phoenix.js code reveals these options:
 *                                    - transport (either window.WebSocket or phoenix.LongPoll)
 *                                    - encode (The function to encode outgoing messages.)
 *                                    - decode (The function to decode outgoing messages.)
 *                                    - timeout (The default timeout in milliseconds to trigger push timeouts.)
 *                                    - heartbeatIntervalMs (The millisec interval to send a heartbeat message)
 *                                    - reconnectAfterMs (The optional function that returns the millsec reconnect interval.)
 *                                    - logger (The optional function for specialized logging. Signature: `function(kind, msg, data)`)
 *                                    - longpollerTimeout (The maximum timeout of a long poll AJAX request.)
 *                                    - params (Optional params to pass when connecting.) -- e.g. An access token.
 * @param {Function} topicProvider  (Optional) A function which, given a channel topic, returns a "qualified" topic.
 *                                  (Can be used to interpolate a user ID into topic names.)
 */
function portsFactory(phoenix, endpoint, options, topicProvider) {
  const topicProvider_ = topicProvider || (topic => topic); // Default topicProvider to identity function
  const channels = {};

  if (!phoenix.Socket || typeof phoenix.Socket !== 'function') {
    throw new Error(
      'The first argument for elm-phoenix-websocket-ports must be the Phoenix '
      + 'JavaScript client containing a Socket constructor'
    );
  }

  options = options || {};

  if (options && typeof options !== 'object') {
    throw new Error(
      'The third (optional) argument for elm-phoenix-websocket-ports must be '
      + 'an object or undefined. Valid options in the object are documented in the JSDoc '
      + 'of the Socket constructor at '
      + 'https://github.com/phoenixframework/phoenix/blob/master/assets/js/phoenix.js'
    );
  }

  if (typeof topicProvider_ !== 'function') {
    throw new Error(
      'The third (optional) argument for elm-phoenix-websocket-ports must be '
      + 'a function that takes a websocket topic name and returns a modified version '
      + 'of the topic.'
    );
  }

  const socket = new phoenix.Socket(endpoint, options);
  socket.connect();

  /**
   * Register Websocket ports for the given Elm app.
   *
   * @param  {Object}   ports  Ports object from an Elm app
   * @param  {Function} log    Function to log ports for the given Elm app
   */
  function register(ports, log) {
    ports.websocketSend.subscribe(websocketSend);
    ports.websocketListen.subscribe(websocketListen);

    log = log || function() {};

    /**
     * Send a Websocket message.
     *
     * @param  {String} topic   The channel topic (e.g. 'messages')
     * @param  {String} event   The event (e.g. 'new:message')
     * @param  {Object} payload The payload to send along with the message
     */
    function websocketSend([topic, event, payload]) {
      ensureChannelJoined(topic);

      log('websocketSend', topic, event, payload);
      channels[topic].push(event, payload);
    }

    /**
     * Set up the Elm app to listen to the given channel for messages of the given topic.
     * When received, forward them to the Elm app via the `receive` port.
     *
     * @param  {String} topic The channel topic (e.g. 'messages')
     * @param  {String} event The event to listen for (e.g. 'new:message')
     */
    function websocketListen([topic, event]) {
      ensureChannelJoined(topic);

      channels[topic].on(event, payload => {
        log('websocketReceive', topic, event, payload);
        ports.websocketReceive.send([topic, event, payload]);
      });
    }

    /**
     * Ensure the given channel (topic) has been joined.
     *
     * @param  {String} topic Name of the Phoenix channel
     */
    function ensureChannelJoined(topic) {
      if (! channels[topic]) {
        channels[topic] = socket.channel(topicProvider_(topic));
        channels[topic].join();

        log('Joined channel', topicProvider_(topic));
      }
    }
  }

  return {
    register: register,
    samplePortName: 'websocketSend'
  };
}

module.exports = portsFactory;

function portsFactory(phoenix, endpoint, topicProvider_) {
  const topicProvider = topicProvider_ || (topic => topic); // Default topicProvider to identity function
  const channels = {};

  if (!phoenix.Socket || typeof phoenix.Socket !== 'function') {
    throw new Error(
      'The first argument for elm-phoenix-websocket-ports must be the Phoenix '
      + 'JavaScript client containing a Socket constructor'
    );
  }

  if (typeof topicProvider !== 'function') {
    throw new Error(
      'The third (optional) argument for elm-phoenix-websocket-ports must be '
      + 'a function that takes a websocket topic name and returns a modified version '
      + 'of the topic.'
    );
  }

  socket = new phoenix.Socket(endpoint);
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
        channels[topic] = socket.channel(topicProvider(topic));
        channels[topic].join();

        log('Joined channel', topicProvider(topic));
      }
    }
  }

  return {
    register: register,
    samplePortName: 'websocketSend'
  };
}

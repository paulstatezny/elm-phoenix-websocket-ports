const websocketPorts = require('../src/phoenix-websocket-ports');

function port(portFn) {
  return portFn.subscribe.mock.calls[0][0];
}

describe('phoenix-websocket-ports', () => {
  const mockPorts = {};
  const mockPhoenix = {};
  const mockSocket = {};
  const mockChannel = {};

  function resetMocks() {
    mockPorts.websocketSend = {subscribe: jest.fn()};
    mockPorts.websocketListen = {subscribe: jest.fn()};
    mockPorts.websocketReceive = {send: jest.fn()};

    mockChannel.join = jest.fn();
    mockChannel.push = jest.fn();
    mockChannel.on = jest.fn();
    mockSocket.connect = jest.fn();
    mockSocket.channel = jest.fn(() => mockChannel);
    mockPhoenix.Socket = jest.fn(() => mockSocket);
  }

  beforeEach(() => {
    resetMocks();
    websocketPorts(mockPhoenix, '/socket').register(mockPorts);
  });

  test('throws an Error if the first argument given to the factory isn\'t an object looking like the Phoenix JavaScript client', () => {
    resetMocks();

    expect(() => {
      websocketPorts({foo: 'bar'}, 'baz');
    }).toThrow();
  });

  test('throws an Error if the third argument given to the factory is provided but is not a function', () => {
    resetMocks();

    expect(() => {
      websocketPorts(mockPhoenix, '/socket', 'not a function');
    }).toThrow();
  });

  test('makes a socket connection', () => {
    expect(mockSocket.connect).toHaveBeenCalled();
  });

  describe('websocketSend', () => {
    beforeEach(() => {
      port(mockPorts.websocketSend)(['myTopic', 'myEvent', {foo: 'bar'}]);
    });

    test('joins the channel if it hasn\'t been joined', () => {
      expect(mockSocket.channel).toHaveBeenCalledWith('myTopic');
      expect(mockChannel.join).toHaveBeenCalled();
    });

    test('runs the topic through topicProvider before joining the channel', () => {
      resetMocks();
      websocketPorts(mockPhoenix, '/socket', topic => topic + ":test").register(mockPorts);
      port(mockPorts.websocketSend)(['myTopic', 'myEvent']);

      expect(mockSocket.channel).toHaveBeenCalledWith('myTopic:test');
    });

    test('does not re-join the channel if it has already been joined', () => {
      port(mockPorts.websocketSend)(['myTopic', 'myEvent']);
      port(mockPorts.websocketSend)(['myTopic', 'myEvent2']);
      port(mockPorts.websocketSend)(['myTopic', 'myEvent3']);

      expect(mockSocket.channel).toHaveBeenCalledWith('myTopic');
      expect(mockSocket.channel).toHaveBeenCalledTimes(1);
    });

    test('pushes the event and payload on the channel', () => {
      expect(mockChannel.push).toHaveBeenCalledWith('myEvent', {foo: "bar"});
    });
  });

  describe('websocketListen', () => {
    beforeEach(() => {
      port(mockPorts.websocketListen)(['someTopic', 'someEvent']);
    });

    test('joins the channel if it hasn\'t been joined', () => {
      expect(mockSocket.channel).toHaveBeenCalledWith('someTopic');
      expect(mockChannel.join).toHaveBeenCalled();
    });

    test('runs the topic through topicProvider before joining the channel', () => {
      resetMocks();
      websocketPorts(mockPhoenix, '/socket', topic => topic + ":testing").register(mockPorts);
      port(mockPorts.websocketListen)(['myTopic', 'myEvent']);

      expect(mockSocket.channel).toHaveBeenCalledWith('myTopic:testing');
    });

    test('does not re-join the channel if it has already been joined', () => {
      port(mockPorts.websocketListen)(['someTopic', 'oneEvent']);
      port(mockPorts.websocketListen)(['someTopic', 'anotherEvent']);
      port(mockPorts.websocketSend)(['someTopic', 'yetAnotherEvent']);

      expect(mockSocket.channel).toHaveBeenCalledWith('someTopic');
      expect(mockSocket.channel).toHaveBeenCalledTimes(1);
    });

    test('adds an event listener to the channel for the given event', () => {
      expect(mockChannel.on).toHaveBeenCalledWith('someEvent', expect.anything());
    });

    test('the event listener sends a message to the websocketReceive port with the topic, event, and payload received', () => {
      mockChannel.on.mock.calls[0][1]({foo: 'payloadData'});
      expect(mockPorts.websocketReceive.send).toHaveBeenCalledWith([
        'someTopic',
        'someEvent',
        {foo: 'payloadData'}
      ]);
    });
  });
});

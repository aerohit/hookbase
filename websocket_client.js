function HookBase(server_url) {
  var ws_connection = new WebSocket(server_url);

  this.onOpen = function(callback) {
    //ws_connection.onopen(callback);
    ws_connection.onopen = callback;
  };

  this.onClose = function(callback) {
    ws_connection.onclose = callback;
  };

  this.onMessage = function(callback) {
    ws_connection.onmessage = callback;
  };

  this.onError = function(callback) {
    ws_connection.onerror = callback;
  };

  this.sendString = function(data) {
    ws_connection.send(data);
  };

  this.sendJS = function(data) {
    ws_connection.send(JSON.stringify(data));
  }

  this.closeConnection = function() {
    ws_connection.close();
  };
}

var my_socket = new HookBase("ws:0.0.0.0:8125");

my_socket.onOpen(function(event) {
  console.log("Connection open", event);
  my_socket.sendString("Hello from client");

  my_socket.sendJS({
    type: "message",
    text: "Sending some request",
    id:   "x123",
    date: Date.now()
  });
});

my_socket.onMessage(function(event) {
  console.log(event.data);
});

my_socket.onError(function(event) {
  console.log("ERROR: ", event);
});

my_socket.onClose(function(event) {
  console.log("Socket closed ", event);
});

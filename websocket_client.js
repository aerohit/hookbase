function HookBase(server_url) {
  var ws_connection   = new WebSocket(server_url);
  var push_callback   = undefined;
  var remove_callback = undefined;
  var getAll_callback = undefined;

  this.push = function(message, callback) {
    push_callback = callback;
    sendJS({
      request: "push",
      data:    message
    });
  };

  this.remove = function(id, callback) {
    remove_callback = callback;
    sendJS({
      request: "remove",
      id:      id
    });
  };

  this.getAll = function(callback) {
    getAll_callback = callback;
    sendJS({
      request: "getAll"
    });
  }

  var sendJS = function(data) {
    ws_connection.send(JSON.stringify(data));
  }

  ws_connection.onmessage = function(event) {
    data = JSON.parse(event.data);
    if (isPushed(data) && push_callback) {
      push_callback(data);
    } else if (isRemoved(data) && remove_callback) {
      remove_callback(data);
    } else if (isGetAll(data) && getAll_callback) {
      getAll_callback(data);
    } else {
      console.log("UNHANDLED: ", data);
    }
  };

  var isPushed = function(data) {
    return hasVal(data, "pushed");
  }

  var isRemoved = function(data) {
    return hasVal(data, "removed");
  }

  var isGetAll = function(data) {
    return hasVal(data, "respondingAll");
  }

  var hasVal = function(data, val) {
    return data["response"] == val;
  }

  this.onOpen = function(callback) {
    ws_connection.onopen = callback;
  };
}

var my_socket = new HookBase("ws:0.0.0.0:8125");

my_socket.onOpen(function(event) {
  console.log("Connection open", event);

  my_socket.push("IT", function(data) { console.log("Inserted: ", data); });
});

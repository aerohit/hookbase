function HookBase(serverUrl) {
  var wsConnection = new WebSocket(serverUrl);

  var pushCallback        = undefined;
  var removeCallback      = undefined;
  var getAllCallback      = undefined;
  var dataChangedCallback = undefined;

  this.push = function(message, callback) {
    pushCallback = callback;
    sendJS({
      request: "push",
      data:    message
    });
  };

  this.remove = function(id, callback) {
    removeCallback = callback;
    sendJS({
      request: "remove",
      id:      id
    });
  };

  this.getAll = function(callback) {
    getAllCallback = callback;
    sendJS({
      request: "getAll"
    });
  };

  this.onDataChange = function(callback) {
    dataChangedCallback = callback;
  };

  var sendJS = function(data) {
    wsConnection.send(JSON.stringify(data));
  };

  wsConnection.onmessage = function(event) {
    data = JSON.parse(event.data);
    if (isPushed(data)) {
      if (pushCallback) pushCallback(data);
    } else if (isRemoved(data)) {
      if (removeCallback) removeCallback(data);
    } else if (isGetAll(data)) {
      if (getAllCallback) getAllCallback(data);
    } else if (isDataChanged(data)) {
      if (dataChangedCallback) dataChangedCallback(data);
    } else {
      console.log("UNHANDLED: ", data);
    }
  };

  var isPushed = function(data) {
    return hasVal(data, "pushed");
  };

  var isRemoved = function(data) {
    return hasVal(data, "removed");
  };

  var isGetAll = function(data) {
    return hasVal(data, "respondingAll");
  };

  var isDataChanged = function(data) {
    return hasVal(data, "dataChanged");
  };

  var hasVal = function(data, val) {
    return data["response"] == val;
  };

  this.onOpen = function(callback) {
    wsConnection.onopen = callback;
  };
}

var mySocket = new HookBase("ws:0.0.0.0:8125");
mySocket.onDataChange(function(data) {
  console.log("Data changed...: ", data);
});

mySocket.onOpen(function(event) {
  console.log("Connection open", event);

  mySocket.push("IT", function(data) { console.log("Inserted: ", data); });
});

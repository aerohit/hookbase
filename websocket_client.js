var my_socket = new WebSocket("ws:0.0.0.0:8125");

my_socket.onopen = function (event) {
  console.log("Connection open", event);
  my_socket.send("Hello from client");

  sendJS({
    type: "message",
    text: "Sending some request",
    id:   "x123",
    date: Date.now()
  });
};

my_socket.onmessage = function (event) {
  console.log(event.data);
};

my_socket.onerror = function (event) {
  console.log("ERROR: ", event);
};

my_socket.onclose = function (event) {
  console.log("Socket closed ", event);
};

function sendJS(data) {
  my_socket.send(JSON.stringify(data));
}



// load the http module
var http = require('http');

// configure our HTTP server
var server = http.createServer(function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end("Wow another Hello World app number 5000\n");
});

// listen on localhost:8000
server.listen(8000);
console.log("Server listening at http://x.x.x.x:8000/");
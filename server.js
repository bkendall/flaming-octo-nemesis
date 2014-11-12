var http = require('http');
var port = process.env.PORT || 8080;
var user = process.env.FON_USER || 'user';
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello, ' + user + '!\n\nServed on port ' + port + '\n');
}).listen(port);
console.log('Server running at http://127.0.0.1:' + port + '/');

var http = require('http');
var port = process.env.PORT || 8080;
var user = process.env.FON_USER || 'user';

var Redis = require('redis');
var redis = Redis.createClient(6379, process.env.REDIS_HOSTNAME);

http.createServer(
  function (req, res, next) {
    req._count = -1;
    if (process.env.REDIS_HOSTNAME) {
      redis.incr('thiskey', function (err, count) {
        req._count = count || req._count;
        next(err);
      });
    } else {
      next();
    }
  },
  function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello, ' + user + '!\n\nServed on port ' + port + '\n' + 'Count: ' + req._count + '\n');
  }
).listen(port);
console.log('Server running, at http://127.0.0.1:' + port + '/');

var http = require('http');
var port = process.env.PORT || 8080;
var user = process.env.FON_USER || 'user';

var Redis = require('redis');
var redis = Redis.createClient(6379, process.env.REDIS_HOSTNAME);
redis.on('error', function (err) {
  console.error('redis error:', err);
});

http.createServer(
  function (req, res) {
    req._count = -1;
    if (process.env.REDIS_HOSTNAME) {
      incrPath(req.url);
      redis.incr('thiskey', function (err, count) {
        if (err) { console.error('redis error inc:', err); }
        req._count = count || req._count;
        writeResponse(req, res);
      });
    } else {
      writeResponse(req, res);
    }
  }
).listen(port);
console.log('Server running, at http://127.0.0.1:' + port + '/');

function incrPath (path) {
  redis.hincrby('reqPaths', path, 1, function (err) {
    if (err) { console.error('redis err hincrby:', err); }
    redis.hgetall('reqPaths', function (err, data) {
      console.log(err, data);
    });
  });
}

function writeResponse (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello, ' + user + '!\n\nServed on port ' + port + '\n' + 'Count: ' + req._count + '\n');
}

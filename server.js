var http = require('http');
var port = process.env.PORT || 8080;
var user = process.env.FON_USER || 'user';
var async = require('async');

var Redis = require('redis');
var redis = Redis.createClient(6379, process.env.REDIS_HOSTNAME);
redis.on('error', function (err) {
  console.error('redis error:', err);
});

http.createServer(
  function (req, res) {
    req._count = -1;
    req._path_count = -1;
    async.series([
      function countThings (cb) {
        if (process.env.REDIS_HOSTNAME) {
          incrPath(req.url);
          redis.incr('thiskey', function (err, count) {
            req._count = count || req._count;
            cb(err);
          });
        } else {
          cb();
        }
      },
      function getPathCount (cb) {
        redis.hget('reqPaths', req.url, function (err, count) {
          req._path_count = count || req._path_count;
          cb(err);
        });
      },
      function respond (cb) {
        writeResponse(req, res);
        cb();
      }
    ], function (err) { });
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
  res.end([
    'Hello, ' + user + '!',
    '',
    'Served on port ' + port,
    'All count: ' + req._count,
    'Path count: ' + req._path_count
  ].join('\n'));
}

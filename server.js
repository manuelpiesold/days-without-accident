
var
    express      = require('express'),
    app          = require('express')(),
    http         = require('http').Server(app),
    io           = require('socket.io')(http),
    fs           = require('fs'),
    childProcess = require('child_process'),
    cmd          = __dirname + '/getLatestHotfixCreationTimestamp.sh',
    maxTimestamp = '1',
    config       = {}
;

var config = JSON.parse(((fs.readFileSync('config.json')).toString('utf-8')));

['public'].forEach(function(dir) {
  app.use('/' + dir, express.static(__dirname + '/' + dir));
});

app.get('/', function(req, res) {
  res.sendFile('index.html', {
    root: __dirname + '/public/',
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  });
});

http.listen({
  host: config.server.host,
  port: config.server.port,
  exclusive: true
}, function() {
  console.log('app listening on ' + config.server.host + ':' + config.server.port);
});

io.on('connection', function(socket) {
  var timestamp;
  setInterval(function() {
    for (var i = 0; i < config.workspaces.length; i++) {
      childProcess.exec(cmd + ' ' + config.workspaces[i], function(error, stdout, stderr) {
        timestamp = stdout.replace('\n', '');
        if (timestamp > maxTimestamp) {
          maxTimestamp = timestamp;
          socket.emit('new-accident-found', { timestamp: maxTimestamp, workspace: config.workspaces[i] });
        }
      });
    }
  }, 5000);

  socket.emit('new-accident-found', { timestamp: maxTimestamp });
});

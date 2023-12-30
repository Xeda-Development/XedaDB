const fs = require('fs');
const yaml = require('js-yaml');
const pack = require("msgpack-lite");
const Client = require('./client');

var express = require('express');
var app = express();
require('express-ws')(app);

const CONSTANTS = require('./CONSTANTS');

function handleError(err, error, exit) {
  console.error(`> Error: ${err} - ${String(error)}`);

  if (exit) {
    console.log(`> Major error. Exiting...`);
    process.exit(1);
  } else {
    console.log(`> Error detected. Ignoring...`);
  }
}

function loadConfig(filePath) {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const config = yaml.load(fileContents);
    return config;
  } catch (error) {
    handleError(`Failed to load config file at ${filePath}`, error, true);
  }
}

const config = loadConfig(CONSTANTS.ConfigPath);

app.ws('/', function(ws, req) {
  ws.req = req;
  var IP = req.ip;

  console.log(IP + ' Client connected');

  const client = new Client(app, ws);

  ws.on('close', () => {
    console.log('Client '+IP+' closed');
  });

  ws.on('message', function(data) {
    try {
      data = pack.decode(data);

      client.onData(data);
    } catch(e) {
      ws.send('Error: ' + String(e))
    }
  });
});

app.on('error', (error) => {
  handleError('Failed to start TCP server', error, true)
});

var ip = config.server.ip;
var port = config.server.port;

if (process.env.SERVER_IP) {
  // Todo: log something
  ip = process.env.SERVER_IP;
}
if (process.env.SERVER_PORT) {
  // Todo: log something
  port = process.env.SERVER_PORT;
}

console.log(`> Going to listen on ${ip}:${port}`)

app.listen(port, ip, () => {
  console.log(`Server listening on ${ip}:${port}`);
});
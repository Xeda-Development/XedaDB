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

function overrideConfigWithCommandLineArgs(config) {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i += 2) {
    const argName = args[i].replace('--', '');
    const argValue = args[i + 1];
    config[argName] = argValue;
    console.log(`> ${argName} is overwritten by CL args`);
  }
  return config;
}

var config = loadConfig(CONSTANTS.ConfigPath);

config = overrideConfigWithCommandLineArgs(config);

app.ws('/', function(ws, req) {
  ws.req = req;
  var IP = req.ip;

  req.getOption = getOption;

  console.log(IP + ' Client connected');

  const client = new Client(app, ws);

   ws.on('close', () => {
    console.log('Client '+IP+' disconnected');
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

function getOption(name, envName) {
  var res;
  if (!config) throw new Error('No config');

  if (config[name]) res = config[name];
  if (process.env[envName]) {
    console.log(`> ${name} is overwritten by env variable ${envName}`);
    res = process.env[envName];
  }
  return res;
}

var ip = getOption('server_ip', 'SERVER_IP')
var port = getOption('server_port', 'SERVER_PORT');

app.listen(port, ip, () => {
  console.log(`> Server listening on ${ip}:${port}`);
});

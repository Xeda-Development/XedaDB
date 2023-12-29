const fs = require('fs');
const yaml = require('js-yaml');
const net = require('net');

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

function startTCPServer(ip, port) {
  const server = net.createServer((socket) => {
    console.log('Client connected');

    socket.on('data', (data) => {
      console.log(`Received data from client: ${data}`);
    });

    socket.on('end', () => {
      console.log('Client closed');
    });
  });

  server.on('error', (error) => {
    console.error('Server err:', error.message);
    process.exit(1);
  });

  server.listen(port, ip, () => {
    console.log(`Server listening on ${ip}:${port}`);
  });
}

const configFilePath = 'config.yml';
const config = loadConfig(configFilePath);

startTCPServer(config.server.ip, config.server.port);

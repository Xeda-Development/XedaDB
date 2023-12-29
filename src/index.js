const fs = require('fs');
const yaml = require('js-yaml');
const net = require('net');

function loadConfig(filePath) {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const config = yaml.load(fileContents);
    return config;
  } catch (error) {
    console.error(`Err loading cfg file: ${filePath}`);
    console.error(error.message);
    process.exit(1);
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

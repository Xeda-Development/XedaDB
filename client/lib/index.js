const Net = require('net');
const { log } = console;

class Client {
    constructor(ip, port, password) {
        this.ip = ip;
        this.port = port;
        this.password = password;

    }

    async connect() {
        var a;
        a = this;
        const client = new Net.Socket();
        client.connect({ port: port, host: host }), function() {
            log(`> Connected to ${ip}:${port}`);

            if (a.onConnect) a.onConnect();
        });
        
        client.on('data', function(chunk) {
            if (a.onData) a.onData(chunk);
            // client.end();
        });
        
        client.on('end', function() {
            if (a.onEnd) a.onEnd();
            console.log('Requested an end to the TCP connection');
        });

        this.conn = client;
    }

    async onConnect() {
        const client = this.client;

        
    }
}

module.exports = Client;

const Net = require('net');
const { log } = console;
const pack = require("msgpack-lite");

class Client {
    constructor(ip, port, password, disableAutoConnect) {
        this.ip = ip;
        this.port = port;
        this.password = password;

        if (!disableAutoConnect) this.connect();
    }

    async connect() {
        var a;
        a = this;
        const client = new Net.Socket();

        
        client.connect({ port: a.port, host: a.host }, function() {
            if (a.onConnect) a.onConnect();
        });
        
        client.on('data', function(chunk) {
            if (a.onData) {
                try {
                    chunk = pack.decode(chunk);
                    a.onData(chunk);
                } catch(e) {
                    log(`> Client parse error: ${String(e)}`);
                }
                
            }
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

        log(`> Connected to ${this.ip}:${this.port}`);
    }

    async onData(data) {
        console.log('data: ', data)
    }
}

module.exports = Client;

const Net = require('net');
const { log } = console;
const pack = require("msgpack-lite");

const WebSocket = require('ws');

class Client {
    constructor(url, password) {
        this.url = url;
        this.password = password;

        var a;
        a = this;

        if (!url.startsWith('ws://') && !url.startsWith('wss://')) throw new Error(`Url (${url}) needs to start with ws:// or wss://`);

        const client = new WebSocket(url);
        this.client = client;
        
        client.on('error', (e1, e2) => {
            console.error('WS error:', e1, e2)
        });
        client.on('open', function open() {
            log('> Connection opened!')
            if (a.onConnect) {
                a.onConnect();   
                log('> Listening for messages!');
            }
        });
    }

    async connect() {
        // Deprecated
        console.warn(`Warning: <Client>.connect() is deprecated`);
    }

    async onConnect() {
        const client = this.client;

        var a;
        a = this; 

        this.client.send(pack.encode(
            ['AUTH', [this.password]]
        ));

        client.on('message', function(chunk) {
            if (a.onData) {
                if (String(chunk).startsWith('Error')) return console.warn(`Server encountered an error! ${String(chunk)}`);
                try {
                    chunk = pack.decode(chunk);
                    a.onData(chunk);
                } catch(e) {
                    log(`> Client parse error: ${String(e)}`, chunk);
                }
                
            }
        });

        log(`> Connected to ${this.url}`);
    }

    async onData(data) {
        console.log('data: ', data);
        this.client.send(pack.encode(['ACK', [data[1], data[0]]])); // At the moment, this is unused by the server
    }
}

module.exports = Client;

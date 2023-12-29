const pack = require("msgpack-lite");

class DBClient {
    constructor(server, socket) {
        this.server = server;
        this.socket = socket;
        this.ID = Math.floor(Math.random() * 1000);

        this.sendPacket('AUTH');
    }

    async onData(data) {
        console.log(`> [${this.ID}] Got data from ${this.socket.address().address}:${this.socket.address().port}: ${json.stringify(data)}`);
    }

    async sendPacket(packetId, args) {
        if (!packetId) packetId = 'UNKNOWN';
        if (!args) args = [];
        this.socket.write(pack.encode([
            packetId,
            args
        ]));
    }
}

module.exports = DBClient;
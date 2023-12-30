const pack = require("msgpack-lite");

class DBClient {
    constructor(app, ws) {
        this.app = app;
        this.ws = ws;
        this.req = ws.req;

        this.cmdId = 0;

        this.ID = Math.floor(Math.random() * 1000000);
        this.changeState('PRE');

        console.log('mau')

        this.sendPacket('AUTH');
        this.sendPacket('CLIENTDATA', [
            this.ID,
            this.state
        ]);
    }

    changeState(state) {
        this.state = state;
        this.sendPacket('STATE', [state]);
    }

    onData(data) {
        console.log(`> [${this.ID}] Got data from ${this.req.ip}: ${JSON.stringify(data)}`);
    }

    async sendPacket(packetId, args) {
        if (!packetId) packetId = 'UNKNOWN';
        if (!args) args = [];
        this.cmdId++;
        this.ws.send(pack.encode([
            packetId,
            this.cmdId,
            args
        ]));
        console.log(`> Sent packet ${packetId} (${this.cmdId}) to ${this.ID}`)
    }


}

module.exports = DBClient;
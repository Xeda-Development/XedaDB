const pack = require("msgpack-lite");

class DBClient {
    constructor(server, socket) {
        this.server = server;
        this.socket = socket;

        this.ID = Math.floor(Math.random() * 1000);
        this.changeState('PRE');

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
        console.log(`> [${this.ID}] Got data from ${this.socket.address().address}:${this.socket.address().port}: ${json.stringify(data)}`);
    }

    sendPacket(packetId, args) {
        if (!packetId) packetId = 'UNKNOWN';
        if (!args) args = [];
        this.socket.write(pack.encode([
            packetId,
            args
        ]));
        return true;
    }
}

module.exports = DBClient;
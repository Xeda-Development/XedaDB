const pack = require("msgpack-lite");

class DBClient {
    constructor(server, socket) {
        this.server = server;
        this.socket = socket;

        this.socket.on('drain', (e) => {
            console.log('dr', e);
        })

        this.canSendOK = null;
        var a;
        a = this;
        this.canSend = new Promise(resolve => {
            a.canSendOK = resolve;
        });

        this.ID = Math.floor(Math.random() * 1000);
        this.changeState('PRE');

        console.log('mau')

        this.sendPacket('AUTH');
        this.sendPacket('CLIENTDATA', [
            this.ID,
            this.state
        ]);
        console.log('send');
    }

    changeState(state) {
        this.state = state;
        this.sendPacket('STATE', [state]);
    }

    onData(data) {
        console.log(`> [${this.ID}] Got data from ${this.socket.address().address}:${this.socket.address().port}: ${json.stringify(data)}`);

        this.canSend(true)
    }

    async sendPacket(packetId, args) {
        await this.canSendOK == true;
        if (!packetId) packetId = 'UNKNOWN';
        if (!args) args = [];
        if (this.socket.destroyed) return;
        this.socket.write(pack.encode([
            packetId,
            args
        ]));
        console.log(`> Sent packet ${packetId} to ${this.ID}`)
    }


}

module.exports = DBClient;
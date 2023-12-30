const pack = require("msgpack-lite");

class DBClient {
    constructor(app, ws) {
        this.app = app;
        this.ws = ws;
        this.req = ws.req;

        this.isAuthenticated = false;
        this.getOption = this.req.getOption;

        this.cmdId = 0;

        this.ID = Math.floor(Math.random() * 1000000);
        this.changeState('PRE');

        this.sendPacket('AUTH');

        this.sendClientData();
        this.dataLoop = setInterval(() => {
            this.sendClientData();
        }, 5000);
    }

    sendClientData() {
        this.sendPacket('CLIENTDATA', [
            this.ID, // Client ID
            this.state, // Client state
            Math.floor(process.uptime()) // DB uptime
        ]);
    }

    changeState(state) {
        this.state = state;
        this.sendPacket('STATE', [state]);
    }

    onData(data) {
        // console.log(`> [${this.ID}] Got data from ${this.req.ip}: ${JSON.stringify(data)}`);

        if (data[0] == 'AUTH') {
            var password = data[1][0];
            var ServerPasss = this.getOption('password');
            if (password === ServerPasss) {
                this.isAuthenticated = true;
                this.sendPacket('AUTH_OK', []);
                this.changeState('DATA');
            } else {
                this.sendPacket('AUTH_FAIL', ['PasswordInvalid']);
            }
        }
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
        // console.log(`> Sent packet ${packetId} (${this.cmdId}) to ${this.ID}`)
    }


}

module.exports = DBClient;
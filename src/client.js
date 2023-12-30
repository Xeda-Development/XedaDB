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
        const command = data[0];
        switch (command) {
            case 'AUTH':
                this.handleAuth(data[1]);
                break;
            case 'ACK':
                // ToDo: make a proper ack system
                break;
            default:
                console.log(`> Unhandled command ${command} received from ${this.ID}`);
                break;
        }
    }
    
    handleAuth(authData) {
        const password = authData[0];
        const serverPassword = this.getOption('password');
    
        if (password === serverPassword) {
            this.isAuthenticated = true;
            this.sendPacket('AUTH_OK', []);
            this.changeState('DATA');
        } else {
            this.sendPacket('AUTH_FAIL', ['PasswordInvalid']);
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
    }


}

module.exports = DBClient;

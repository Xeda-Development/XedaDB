const pack = require("msgpack-lite");
const fs = require('fs').promises;

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
            case 'QUERY_ALL':
                if (!this.isAuthenticated || this.state !== 'DATA') return this.sendPacket('ERROR', ['INVALID_AUTH-STATE']);
                this.queryAll();
                break;
            case 'ACK':
                // ToDo: make a proper ack system
                break;
            default:
                console.log(`> Unhandled command ${command} received from ${this.ID}`);
                break;
        }
    }

    async queryAll() {
        try {
            const basePath = this.getOption('storagePath');
            const dataFilePath = `${basePath}/data.msgpack`;
            const rawMsgPackData = await fs.readFile(dataFilePath);
            const data = pack.decode(rawMsgPackData);

            this.sendPacket('QUERY_ALL_RESULT', [data]);
        } catch (error) {
            console.error('Error querying data:', error);
            this.sendPacket('ERROR', ['QUERY_FAILED']);
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

    async saveData(data) {
        try {
            const basePath = this.getOption('storagePath');
            const dataFilePath = `${basePath}/data.msgpack`;

            await fs.writeFile(dataFilePath, pack.encode(data));
            console.log('Data saved successfully.');
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    async handleInsertData(newData) {
        if (!this.isAuthenticated || this.state !== 'DATA') {
            return this.sendPacket('ERROR', ['INVALID_AUTH-STATE']);
        }

        try {
            const basePath = this.getOption('storagePath');
            const dataFilePath = `${basePath}/data.msgpack`;
            const rawMsgPackData = await fs.readFile(dataFilePath);
            const existingData = pack.decode(rawMsgPackData);

            existingData.push(newData);
            await this.saveData(existingData);

            this.sendPacket('INSERT_DATA_OK', []);
        } catch (error) {
            console.error('Error inserting data:', error);
            this.sendPacket('ERROR', ['INSERT_FAILED']);
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

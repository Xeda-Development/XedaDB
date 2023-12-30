const Client = require('./lib');

const db = new Client('ws://127.0.0.1:1895', 'mau', true);
db.connect();
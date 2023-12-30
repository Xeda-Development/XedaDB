const Client = require('./lib');

const db = new Client('ws://n2.meegie.net:3007', 'ExamplePasswordChangeMe');
var allDocs = db.getAll({}); // Get all documents
console.log(allDocs);
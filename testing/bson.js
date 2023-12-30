const { BSON, EJSON, ObjectId } = require('bson');

// const bytes = BSON.serialize({ _id: new ObjectId() });
const bytes = BSON.serialize({ name: 'Max' });
console.log(bytes, String(bytes));
const doc = BSON.deserialize(bytes);
console.log(EJSON.stringify(doc));
// {"_id":{"$oid":"..."}}
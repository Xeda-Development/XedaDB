const fs = require('fs');
const crypto = require('crypto');

// Function to save data to a JSON file
function saveDataToDisk(data, fileName) {
  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(fileName, jsonData);
}

// Function to load data from a JSON file
function loadDataFromDisk(fileName) {
  const jsonData = fs.readFileSync(fileName, 'utf8');
  return JSON.parse(jsonData);
}

// Sample NoSQL Database
let MyNoSQLDB = {
  // Collection for storing user data
  users: [
    { id: 1, name: 'Alice', age: 25 },
    { id: 2, name: 'Bob', age: 30 },
    { id: 3, name: 'Charlie', age: 22 },
    // ... more user documents
  ],

  // Index for quick lookup by user name
  indexByName: {},
  // Partitioned hash-based index for quicker lookups
  hashIndexPartitions: [], // Array to hold partitions
};

// Function to create an index partition on a specific field using MD5 hashing and partitioning
function createPartitionedIndex(collection, fieldName, numPartitions) {
  const partitions = Array.from({ length: numPartitions }, () => ({})); // Create empty partitions

  collection.forEach((document, i) => {
    const key = document[fieldName];
    const hash = crypto.createHash('md5').update(key).digest('hex');
    const partition = Math.abs(hash.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % numPartitions;

    if (!partitions[partition][hash]) partitions[partition][hash] = [];
    partitions[partition][hash].push(i);
  });

  return partitions;
}

// Load data from a JSON file if it exists
const dataFilePath = 'myNoSQLDB.json';
if (fs.existsSync(dataFilePath)) {
  MyNoSQLDB = loadDataFromDisk(dataFilePath);
} else {
  // Create partitioned index on the 'name' field for the 'users' collection with 3 partitions
  MyNoSQLDB.hashIndexPartitions = createPartitionedIndex(MyNoSQLDB.users, 'name', 3);
  // Save the initial data to disk
  saveDataToDisk(MyNoSQLDB, dataFilePath);
}

// Function to perform a quick lookup using the partitioned hash-based index with MD5 hashing
function findByFieldPartitioned(collection, partitions, fieldName, value) {
  const hash = crypto.createHash('md5').update(value).digest('hex');
  const partition = Math.abs(hash.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % partitions.length;
  const partitionIndex = partitions[partition];
  const entries = partitionIndex[hash];

  if (entries) {
    // Return the matching entries
    const results = entries.map((index) => collection[index]);
    return results;
  } else {
    // No matching entries found
    return [];
  }
}

// Example: Find users with the name 'Bob' using the partitioned hash-based index with MD5 hashing
const resultsPartitioned = findByFieldPartitioned(MyNoSQLDB.users, MyNoSQLDB.hashIndexPartitions, 'name', 'Bob');
console.log('Results with Partitioned Hash-based Index using MD5:', resultsPartitioned);

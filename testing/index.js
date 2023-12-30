const fs = require("fs");

// Initial partition size limit
const partitionSizeLimit = 2; // For example purposes, set a small partition limit

// Sample database array
let database = [
  { id: 1, name: "John", age: 25 },
  { id: 2, name: "Alice", age: 30 },
  { id: 3, name: "Bob", age: 28 },
  { id: 4, name: "Eve", age: 26 },
  { id: 5, name: "Mark", age: 32 },
  // Additional entries might be added dynamically
];

// Index object to store references for quick access
let index = {};

// Cache object to store frequently accessed data
let cache = {};

// Function to create an index based on a specific property
function createIndex(property) {
  index[property] = {};
  for (let i = 0; i < database.length; i++) {
    let entry = database[i];
    if (!index[property][entry[property]]) {
      index[property][entry[property]] = [];
    }
    index[property][entry[property]].push(entry);
  }
}

// Loading data from partitions instead of database.json
loadFromPartitions();

// Creating index on 'name', 'id', and 'age' properties
createIndex("name");
createIndex("id");
createIndex("age");

// Save index and cache to a file
function saveToFile() {
  const dataToSave = {
    index,
    cache,
  };

  fs.writeFileSync("database.json", JSON.stringify(dataToSave, null, 2));
  console.log("Index and cache saved to file.");
}

// Load data from partitions to the database
function loadFromPartitions() {
  const loadedPartitions = loadPartitions();
  database = loadedPartitions.flat(); // Flatten partitions into a single database
}

// Function to query by indexed property with caching
function queryByProperty(property, value) {
  const cacheKey = `${property}-${value}`;
  if (cache[cacheKey]) {
    console.log("Data retrieved from cache.");
    return cache[cacheKey];
  }

  if (index[property] && index[property][value]) {
    const result = index[property][value];
    cache[cacheKey] = result;
    console.log("Data retrieved from database and cached.");
    return result;
  }

  return [];
}

// Create operation - Add a new entry to the database
function createEntry(entry) {
  database.push(entry);

  // Check if the partition limit is exceeded, then split the database
  if (database.length > partitionSizeLimit) {
    partitionDatabase();
    partitionIndex(); // Partition the index after partitioning the database
  }

  createIndex("name");
  createIndex("id");
  createIndex("age"); // Re-create index after insertion
  saveToFile(); // Save index and cache to file after addition
}

// Function to partition the database and save partitions to disk
function partitionDatabase() {
  const totalEntries = database.length;
  const numPartitions = Math.ceil(totalEntries / partitionSizeLimit);

  const partitions = [];
  for (let i = 0; i < numPartitions; i++) {
    const start = i * partitionSizeLimit;
    const end = start + partitionSizeLimit;
    partitions.push(database.slice(start, end));
  }

  console.log("Database partitioned into:", partitions.length, "partitions");

  // Save each partition to a separate file
  partitions.forEach((partition, index) => {
    const partitionFilename = `partition_${index + 1}.json`;
    fs.writeFileSync(partitionFilename, JSON.stringify(partition));
    console.log(`Partition ${index + 1} saved to ${partitionFilename}`);
  });
}

// Function to partition the index and save partitions to disk
function partitionIndex() {
  const indexKeys = Object.keys(index);

  indexKeys.forEach((key) => {
    const currentKeyIndex = index[key];
    const keys = Object.keys(currentKeyIndex);
    const indexPartitions = [];

    keys.forEach((innerKey) => {
      const entries = currentKeyIndex[innerKey];
      const numEntries = entries.length;
      const numIndexPartitions = Math.ceil(numEntries / partitionSizeLimit);

      for (let i = 0; i < numIndexPartitions; i++) {
        const start = i * partitionSizeLimit;
        const end = Math.min(start + partitionSizeLimit, numEntries);
        const partitionedEntries = entries.slice(start, end);
        indexPartitions.push({ [innerKey]: partitionedEntries });
      }
    });

    const indexPartitionFilename = `index_partition_${key}.json`;
    fs.writeFileSync(indexPartitionFilename, JSON.stringify(indexPartitions));
    console.log(`Index partition for ${key} saved to ${indexPartitionFilename}`);
  });
}

// Function to load partitions from disk
function loadPartitions() {
  const loadedPartitions = [];
  let partitionIndex = 1;
  let partitionFilename = `partition_${partitionIndex}.json`;

  while (fs.existsSync(partitionFilename)) {
    const data = fs.readFileSync(partitionFilename, "utf8");
    const parsedData = JSON.parse(data);
    loadedPartitions.push(parsedData);
    console.log(`Partition ${partitionIndex} loaded from ${partitionFilename}`);

    partitionIndex++;
    partitionFilename = `partition_${partitionIndex}.json`;
  }

  return loadedPartitions;
}

// Trigger partitioning after adding an entry to the database
createEntry({ id: Date.now(), name: "Pizza", age: 29 }); // Create

console.log('query:', queryByProperty('name', 'Pizza'));

// Save the partitions to disk
partitionDatabase();

// Save the index partitions to disk
partitionIndex();

// Save the index and cache to disk
saveToFile();

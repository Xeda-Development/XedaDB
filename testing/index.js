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

// Loading data from partitions instead of database.json
loadFromPartitions();

// Load index from partitions
loadIndexFromPartitions();

// Function to create an index based on a specific property
function createIndex(property) {
  index[property] = {};

  for (let i = 0; i < database.length; i++) {
    let entry = database[i];
    if (!index[property][entry[property]]) {
      index[property][entry[property]] = [];
    }

    const partitionNumber = Math.floor(i / partitionSizeLimit) + 1; // Get partition number
    if (!index[property][entry[property]].includes(partitionNumber)) {
      index[property][entry[property]].push(partitionNumber);
    }
  }
}

// Save index and cache to a file
function saveToFile() {
  const dataToSave = {
    cache,
  };

  fs.writeFileSync("database.json", JSON.stringify(dataToSave, null, 2));
  console.log("Cache saved to file.");
}

// Load data from partitions to the database
function loadFromPartitions() {
  const loadedPartitions = loadPartitions();
  database = loadedPartitions.flat(); // Flatten partitions into a single database
}

// Function to load index from partition files
function loadIndexFromPartitions() {
  const indexKeys = ['name', 'id', 'age']; // Modify this according to your indexed properties
  indexKeys.forEach((key) => {
    const indexPartitionFilename = `index_partition_${key}.json`;
    if (fs.existsSync(indexPartitionFilename)) {
      const data = fs.readFileSync(indexPartitionFilename, "utf8");
      const parsedData = JSON.parse(data);
      index[key] = parsedData;
      console.log(`Index partition for ${key} loaded from ${indexPartitionFilename}`);
    }
  });
}

// Function to query by indexed property with caching
function queryByProperty(property, value) {
  const cacheKey = `${property}-${value}`;
  if (cache[cacheKey]) {
    console.log("Data retrieved from cache.");
    return cache[cacheKey];
  }

  if (index[property] && index[property][value]) {
    const partitions = index[property][value];
    const results = partitions.flatMap(partitionNumber => {
      const partitionFilename = `partition_${partitionNumber}.json`;
      const partitionData = JSON.parse(fs.readFileSync(partitionFilename, 'utf8'));
      return partitionData.filter(entry => entry[property] === value);
    });

    cache[cacheKey] = results;
    console.log("Data retrieved from database and cached.");
    return results;
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
  saveToFile(); // Save cache to file after addition
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
    const indexPartitions = {};

    for (const propertyValue in currentKeyIndex) {
      indexPartitions[propertyValue] = currentKeyIndex[propertyValue].reduce((acc, partitionNumber) => {
        if (!acc.includes(partitionNumber)) {
          acc.push(partitionNumber);
        }
        return acc;
      }, []);
    }

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
createEntry({ id: Date.now(), name: "Carl", age: 29 }); // Create

console.log('query:', queryByProperty('name', 'Max'));

// Save the partitions to disk
partitionDatabase();

// Save the index partitions to disk
partitionIndex();

// Save the cache to disk
saveToFile();

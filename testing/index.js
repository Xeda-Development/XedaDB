// Sample NoSQL Database
const MyNoSQLDB = {
    // Collection for storing user data
    users: [
      { id: 1, name: 'Alice', age: 25 },
      { id: 2, name: 'Bob', age: 30 },
      { id: 3, name: 'Charlie', age: 22 },
      // ... more user documents
    ],
  
    // Index for quick lookup by user name
    indexByID: {},
  };
  
  // Function to create an index on a specific field
  function createIndex(collection, fieldName) {
    const index = {};
  
    // Populate the index
    collection.forEach((document) => {
      const key = document[fieldName];
      if (!index[key]) {
        index[key] = [];
      }
      index[key].push(document);
    });
  
    return index;
  }
  
  // Create an index on the 'name' field for the 'users' collection
  MyNoSQLDB.indexByID = createIndex(MyNoSQLDB.users, 'id');
  
  // Function to perform a quick lookup using an index
  function findByField(collection, index, fieldName, value) {
    const entries = index[value];
    if (entries) {
      // Return the matching entries
      return entries;
    } else {
      // No matching entries found
      return [];
    }
  }
  
  // Example: Find users with the name 'Bob' using the index
  const results = findByField(MyNoSQLDB.users, MyNoSQLDB.indexByID, 'id', '1');
  console.log('data:', JSON.stringify(MyNoSQLDB, null, 2))
  console.log('results:', results);
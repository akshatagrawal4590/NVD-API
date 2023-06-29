require("dotenv").config();
const {MongoClient} = require("mongodb");
const url = process.env.URL;
const client = new MongoClient(url);
const db_name = process.env.DB_NAME;
let db;
const result = client.connect();
result.then(function(res) {
  db = res.db(db_name);
}).catch(function(error) {
  console.log(error);
});

const dbConnectHardwareCPE = function() {
  return db.collection(process.env.COLLECTION1);
};

const dbConnectSoftwareCPE = function() {
  return db.collection(process.env.COLLECTION2);
};

const dbConnectCVE = function() {
  return db.collection(process.env.COLLECTION3);
};

const createNewCollection = async function(collectionName) {
  return newCollection = await db.createCollection(process.env.NEW_COLLECTION);
};

module.exports = {
  dbConnectHardwareCPE: dbConnectHardwareCPE,
  dbConnectSoftwareCPE: dbConnectSoftwareCPE,
  dbConnectCVE: dbConnectCVE,
  createNewCollection: createNewCollection
}

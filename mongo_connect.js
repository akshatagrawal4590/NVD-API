  const {MongoClient} = require("mongodb");
  const url = "mongodb://0.0.0.0:27017/mdm";
  const client = new MongoClient(url);
  const db_name = "mdm";
  const result = client.connect();
  result.then(function(res) {
    db = res.db(db_name);
  }).catch(function(error) {
    console.log(console.log(error));
  });

const dbConnectHardwareCPE = function() {
  return db.collection('hardwareCPE');
};

const dbConnectSoftwareCPE = function() {
  return db.collection('softwareCPE');
};

const dbConnectCVE = function() {
  return db.collection('cve');
};

module.exports = {
  dbConnectHardwareCPE: dbConnectHardwareCPE,
  dbConnectSoftwareCPE: dbConnectSoftwareCPE,
  dbConnectCVE: dbConnectCVE
}

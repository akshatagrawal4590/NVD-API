const express = require("express");
const bodyParser = require("body-parser");
const {MongoClient} = require("mongodb");
const url = "mongodb://0.0.0.0:27017/mdm";
const client = new MongoClient(url);
const db_name = "mdm";

const app = express();
app.use(bodyParser.urlencoded({extended: true}));

// this route will return both the hardware and the software cpes.
app.get("/cpe", async function(req, res) {
  try
  {
    const result = await client.connect();
    const db = result.db(db_name);
    const collection1 = db.collection('hardwareCPE');
    const collection2 = db.collection('softwareCPE');
    const documents1 = await collection1.find().toArray();
    const documents2 = await collection2.find().toArray();
    const combinedData = {
      hardware_CPEs: documents1,
      software_CPEs: documents2
    };
    res.json(combinedData);
  }
  catch(error)
  {
    console.log(error);
  }
});






app.listen(3000, function() {
  console.log("Server started on Port 3000.");
});

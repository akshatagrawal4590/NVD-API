const express = require("express");
const bodyParser = require("body-parser");
const {dbConnectHardwareCPE, dbConnectSoftwareCPE, dbConnectCVE} = require("./mongo_connect.js");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));

// this route will return both the hardware and the software cpes.
app.get("/cpe", async function(req, res) {
  try
  {
    const collection1 = await dbConnectHardwareCPE();
    const collection2 = await dbConnectSoftwareCPE();
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

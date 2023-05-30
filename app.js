const express = require("express");
const bodyParser = require("body-parser");
const {dbConnectHardwareCPE, dbConnectSoftwareCPE, dbConnectCVE} = require("./mongo_connect.js");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));

// this route will return both the hardware and the software cpes.
app.get("/cpe/:cpeName/:cpeVendor?/:cpeVersion?", async function(req, res) {
  try
  {
    const cpeVendor = req.params.cpeVendor;
    const cpeVersion = req.params.cpeVersion;
    const cpeName = req.params.cpeName;
    const collection1 = await dbConnectHardwareCPE();
    const collection2 = await dbConnectSoftwareCPE();
    let documents1;
    let documents2;
    if(cpeVendor != undefined && cpeVersion != undefined)
    {
      documents1 = await collection1.find({vendor: cpeVendor, model: cpeName, version: cpeVersion}).toArray();
      documents2 = await collection2.find({vendor: cpeVendor, name: cpeName, version: cpeVersion}).toArray();
    }
    else if(cpeVendor == undefined && cpeVersion == undefined)
    {
      documents1 = await collection1.find({model: cpeName}).toArray();
      documents2 = await collection2.find({name: cpeName}).toArray();
    }
    else if(cpeVendor == undefined && cpeVersion != undefined)
    {
      documents1 = await collection1.find({version: cpeVersion, model: cpeName}).toArray();
      documents2 = await collection2.find({version: cpeVersion, name: cpeName}).toArray();
    }
    else
    {
      documents1 = await collection1.find({vendor: cpeVendor, model: cpeName}).toArray();
      documents2 = await collection2.find({vendor: cpeVendor, name: cpeName}).toArray();
    }


    if(documents1.length == 0 && documents2.length == 0)
    {
      res.send("No matching CPEs found.")
    } else {
      const combinedData = {
        hardware_CPEs: documents1,
        software_CPEs: documents2
      };
      res.json(combinedData);
    }
  }
  catch(error)
  {
    console.log("Error in '/cpe/:cpeVendor' route.");
    console.log(error);
  }
});






app.listen(3000, function() {
  console.log("Server started on Port 3000.");
});

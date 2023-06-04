require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const {dbConnectHardwareCPE, dbConnectSoftwareCPE, dbConnectCVE} = require("./mongo_connect.js");
const app = express();
app.use(bodyParser.urlencoded({extended: true}));

app.get("/cpe/:type/:cpeName/:cpeVendor?/:cpeVersion?", async function(req, res) {
  try
  {
    const cpeType = req.params.type;
    const cpeVendor = req.params.cpeVendor;
    const cpeVersion = req.params.cpeVersion;
    const cpeName = req.params.cpeName;
    const collection1 = await dbConnectHardwareCPE();
    const collection2 = await dbConnectSoftwareCPE();
    let documents1 = [];
    let documents2 = [];
    if(cpeVendor != undefined && cpeVersion != undefined)
    {
      if(cpeType == "h")
      {
        documents1 = await collection1.find({vendor: cpeVendor, model: cpeName, version: cpeVersion}).toArray();
      }
      else
      {
        documents2 = await collection2.find({vendor: cpeVendor, name: cpeName, version: cpeVersion}).toArray();
      }
    }
    else if(cpeVendor == undefined && cpeVersion == undefined)
    {
      if(cpeType == "h")
      {
        documents1 = await collection1.find({model: cpeName}).toArray();
      }
      else
      {
        documents2 = await collection2.find({name: cpeName}).toArray();
      }
    }
    else if(cpeVendor == undefined && cpeVersion != undefined)
    {
      if(cpeType == "h")
      {
        documents1 = await collection1.find({version: cpeVersion, model: cpeName}).toArray();
      }
      else
      {
        documents2 = await collection2.find({version: cpeVersion, name: cpeName}).toArray();
      }
    }
    else
    {
      if(cpeType == "h")
      {
        documents1 = await collection1.find({vendor: cpeVendor, model: cpeName}).toArray();
      }
      else
      {
        documents2 = await collection2.find({vendor: cpeVendor, name: cpeName}).toArray();
      }
    }

    if(documents1.length == 0 && documents2.length == 0)
    {
      res.send("No matching CPEs found.")
    }
    else
    {
      let matchingCPEDesc = [];
      documents1.forEach(function(item) {
        if(item.deprecated == true)
        {
          matchingCPEDesc.push(item.deprecatedBy[0].cpeName);
        }
        else
        {
          matchingCPEDesc.push(item.cpeName);
        }
      });
      documents2.forEach(function(item) {
        if(item.deprecated == true)
        {
          matchingCPEDesc.push(item.deprecatedBy[0].cpeName);
        }
        else
        {
          matchingCPEDesc.push(item.cpeName);
        }
      });
      let matchingCVEs = await getCVE(matchingCPEDesc);
      if(cpeType == "h")
      {
        res.json({
          hardware_CPEs: documents1,
          matching_CVEs: matchingCVEs
        });
      }
      else
      {
        res.json({
          software_CPEs: documents2,
          matching_CVEs: matchingCVEs
        });
      }
    }
  }
  catch(error)
  {
    res.write("Error in '/cpe/:type/:cpeName/:cpeVendor?/:cpeVersion?' route.");
    res.write(error);
    res.end();
  }
});

async function getCVE(matchingCPEDesc)
{
  let cveDocs = [];
  const collection3 = await dbConnectCVE();
  cveDocs = await collection3.find({"configurations.nodes.cpeMatch": {$elemMatch: {criteria: {$in: matchingCPEDesc}}}}).toArray();
  return cveDocs;
}

app.listen(process.env.PORT_NO, function() {
  console.log("Server started.");
});

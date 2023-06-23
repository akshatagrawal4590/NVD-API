const express = require("express");
const {dbConnectSoftwareCPE, dbConnectCVE} = require("./mongo_connect.js");
const app = express();

app.get("/", async function(req, res) {
  try
  {
    const collection1 = await dbConnectSoftwareCPE();
    const collection2 = await dbConnectCVE();
    const cpeNames = await getAllCPENames(collection1);
    const size = 3;
    let x = ["enterprise_manager", "corporate_desktop", "shockwave_player", "myfaces_tomahawk"];
    const cpeArray = await getCPEArray(x, collection1, collection2, size);
    res.send(cpeArray);
  }
  catch(error)
  {
    console.log(error);
  }
});

async function getCPEArray(cpeNames, collection1, collection2, size)
{
  let cpeArray = [];
  let batches = [];
  for(let i = 0; i < cpeNames.length; i += size)
  {
    batches.push(cpeNames.slice(i, i + size));
  }
  //console.log(batches);
  for (let j = 0; j < batches.length; j++)
  {
    let tempArr = [];
    for(let i = 0; i < batches[j].length; i++)
    {
      const item = batches[j][i];
      const pipeline = [
        {$match: {name: item}},
        {$project: {_id: 0, version_number: "$version", cpe: "$cpeName"}}
      ];
      try
      {
        const itemArray = await collection1.aggregate(pipeline).toArray();
        for(let i = 0; i < itemArray.length; i++)
        {
          const cpeName = itemArray[i].cpe;
          const cveNameArray = await collection2.find(
              {
                "configurations.nodes.cpeMatch": {
                  $elemMatch: {
                    criteria: cpeName
                  }
                }
              },
              {
                projection: {_id: 0, id: 1}
              }
            ).toArray();
          itemArray[i].cves = cveNameArray;
        }
        const obj = {
          software_name: item,
          versions: itemArray
        };
        tempArr.push(obj);
      }
      catch(err)
      {
        console.log(err);
      }
    }
    cpeArray.push(tempArr);
  }
  return cpeArray;
}


async function getAllCPENames(collection1)
{
  const cpeNames = await collection1.distinct("name", function(softwareNames, err) {
    if(!err)
    {
      return softwareNames;
    }
    else
    {
      console.log(err);
    }
  });
  return cpeNames;
}

app.listen("2000", function() {
  console.log("Server started on Port 2000.");
});

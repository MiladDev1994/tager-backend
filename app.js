const express = require('express');
const fs = require("fs");
const fsExtra = require('fs-extra');
const app = express();
const port = 5001;
const cors = require('cors');
const logger = require('morgan');
const {hasUserChecker} = require("./middleware");
app.use(cors());
app.options('*', cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const {Configs, AllRecords, Labels} = require("./singelton-db");
const { 
  createAndCheckExistConfigFile, 
  // lastIndexSeenByAnyUser,
  checkExistLabelsFile,
  scanDirectory,
  getSetting,
  setSetting,
  extractImage,
} = require("./app-utils");

createAndCheckExistConfigFile()


app.get('/config', (req, res) => {
  return res.status(200).json({
    baseDirectory: Configs.getDirectory(), 
    mode: Configs.getMode()
  })
})


app.put('/config/update', (req, res) => {
  try {
    const newConfig = {
      baseDirectory: req.body.baseUrl,
      mode: req.body.mode,
    }
    Configs.setDirectory(req.body.baseUrl); 
    Configs.setMode(req.body.mode);
    
    fs.writeFile(`.\\config.json`, JSON.stringify(newConfig, null, 4), function(err, result) {
      if(err) console.log(err)
    });

    const dataScan = scanDirectory()
    if (!dataScan.status) return res.status(404).json({message: dataScan.message});
    AllRecords.setAllRecords(dataScan.data);
  
    const labelFileExist = checkExistLabelsFile();
    if (!labelFileExist.status) return res.status(404).json({message: labelFileExist.message});
    Labels.setLabel(labelFileExist.data);
  
    return res.status(200).json({
      ...newConfig, 
      allRecordsLength: AllRecords.getAllRecordLength(),
      message: "meta file created"
    })
  } catch (error) {
    return res.status(500).json({ message: "Server Error!!!"})
  }
})


app.get('/next', hasUserChecker, (req, res) => {
  try {
    const value = req.query.value;
    const index = req.query.index;
    const userName = req.query.userName;
    const saveRecord = setSetting({value, userName, index})
    if (!saveRecord.status) return res.status(500).json({ message: saveRecord.message})

    const newIndex = String(parseInt(index) + 1);
    for (let i = newIndex; i <= AllRecords.getAllRecordLength() + 1; i++){
      if (AllRecords.getRecord(i)){
        const hasItem = AllRecords.getRecord(i);
        const jsonData = getSetting(hasItem.path, userName);
        const images = extractImage(hasItem);

        return res.status(200).json({
          baseDirectory: Configs.getDirectory(),
          mode: Configs.getMode(),
          folderPath: hasItem.path,
          images, 
          index: String(i), 
          tag: (Object.keys(jsonData).length ? jsonData : {}), 
          labels: Labels.getLabel(),
          allRecordsLength: AllRecords.getAllRecordLength(),
          message: "Success"
        })
      }
      if (value && i > AllRecords.getAllRecordLength()) return res.status(404).json({message: "No files found"});
    }
  } catch (error) {
    return res.status(500).json({ message: "Server Error!!!"})
  }
})


app.get("/previous", hasUserChecker, (req, res) => {
  try {
    const value = req.query.value;
    const index = req.query.index;
    const userName = req.query.userName;
    const saveRecord = setSetting({value, userName, index})
    if (!saveRecord.status) return res.status(500).json({ message: saveRecord.message})

    const newIndex = String(parseInt(index) - 1);
    for (let i = newIndex; i > -1; i--){
      if (AllRecords.getRecord(i)){
        const hasItem = AllRecords.getRecord(i);
        const jsonData = getSetting(hasItem.path, userName);
        const images = extractImage(hasItem);

        return res.status(200).json({
          baseDirectory: Configs.getDirectory(),
          mode: Configs.getMode(),
          folderPath: hasItem.path,
          images, 
          index: String(i), 
          tag: (Object.keys(jsonData).length ? jsonData : {}), 
          labels: Labels.getLabel(),
          message: "Success"
        })
      } 
      if (value && i <= 1) return res.status(404).json({message: "No files found"});
    }
  } catch (error) {
    return res.status(500).json({ message: "Server Error!!!"})
  }
})


app.delete("/delete", hasUserChecker, (req, res) => {
  try {
    const moveDirectory = `${Configs.getDirectory().split("\\").slice(0, -1).join("\\")}\\Deleted`;
    const index = req.query.index;
    const itemSelected = AllRecords.getRecord(index)
    const folderNewPath = `${moveDirectory}\\${itemSelected.path.split("\\").pop()}`;
    const jsonPath = `${itemSelected.path.split(".").shift()}.json`;
    const jsonNewPath = `${moveDirectory}\\${itemSelected.path.split("\\").pop()}.json`;

    fsExtra.move(itemSelected.path, folderNewPath, (err) => { 
      if (err) return res.status(500).json({message: "Error!!!"});
      AllRecords.setRecordNull(index);
      fs.writeFile(`${Configs.getDirectory()}/meta_${Configs.getMode()}.json`, JSON.stringify(AllRecords.getAllRecords(), null, 4), function(err, result) {
        if(err) return res.status(500).json({message: "cant create json file"})
      });

      try {
        fsExtra.move(jsonPath, jsonNewPath, (err) => { 
          return res.status(200).json({
            message: "Deleted",
            index,
          }); 
        })
      } catch (error) {
        return res.status(200).json({
          message: "Deleted",
          index,
        });
      }
  })
  } catch (error) {
    return res.status(500).json({ message: "Server Error!!!"})
  }
})

app.get("/test", (req, res) => {
  const json = JSON.parse(fs.readFileSync("./config.json"))
  console.log(json)
  res.status(200).json({name: json})
})


app.listen(port, () => {
  console.log(`App Started on Port ${port}`)
})

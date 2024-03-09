const fs = require("fs");
const {Configs, Labels, AllRecords} = require("./singelton-db")
const folderUtils = require("./folder-utils");
const fileUtils = require("./file-utils");
const colors = require('colors');

function dynamicImport(mode) {
  return mode === "folder" ? folderUtils : fileUtils;
}


function createAndCheckExistConfigFile() {
    try { 
        const readConfig = fs.readFileSync(`.\\config.json`);
        const parseConfig = JSON.parse(readConfig);
        Configs.setMode(parseConfig.mode)
        Configs.setDirectory(parseConfig.baseDirectory);
        createAndCheckExistMEtaFile(parseConfig);
        const labelFileExist = checkExistLabelsFile();
        if (labelFileExist.status) Labels.setLabel(labelFileExist.data);
    } catch (error) {
        const newConfig = {
            baseDirectory: "",
            mode: "file",
        }
        Configs.setDirectory("");
        Configs.setMode("file")
        fs.writeFile(`./config.json`, JSON.stringify(newConfig, null, 4), function(err, result) {
            if(err) console.log(err)
        });
    }
}

function createAndCheckExistMEtaFile(parseConfig) {
  try {
    const readMetaFile = fs.readFileSync(`${parseConfig.baseDirectory}\\meta_${parseConfig.mode}.json`)
    AllRecords.setAllRecords(JSON.parse(readMetaFile));
  } catch (error) {
    console.warn(colors.yellow("warning: meta file not found"))
  }
}
  
function checkExistLabelsFile() {
    try {
      const readLabelsJson = JSON.parse(fs.readFileSync(`${Configs.getDirectory()}\\labels.json`))
      return {status: true, data:readLabelsJson,  message: "success"}
    } catch (error) {
      const message = "Please place the labels file in the project directory"
      console.error(colors.red(`Error: ${message}`));
      return {status: false, message: message}
    }
}

function createDefaultTagForUserInJsonFile({basicTagUsers, userName}) {
  const labels = Labels.getLabel()
  let defaultValue = {
    labels: {
      [userName]: {}
    }
  }
  if (basicTagUsers) {
    defaultValue = {
      labels: {
        ...basicTagUsers,
        [userName]: {}
      }
    }
  }
  
  if (Object.keys(labels).length) {
    for (let i = 0; i < Object.keys(labels).length; i++) {
      defaultValue.labels[userName][Object.keys(labels)[i]] = [""];
    }
  }
  return JSON.stringify(defaultValue);
} 

function scanDirectory(){  
  try {
    const readeMetaDataFile = fs.readFileSync(`${Configs.getDirectory()}\\meta_${Configs.getMode()}.json`)
    const parseMetaData = JSON.parse(readeMetaDataFile)
    return {status: true, data: parseMetaData, message: "meta file found"}
  } catch (error) {
    const allFolderPaths = dynamicImport(Configs.getMode()).scanDirectoryMode();
    if (!allFolderPaths.status) return {status: false, message: allFolderPaths.message}
    fs.writeFile(`${Configs.getDirectory()}\\meta_${Configs.getMode()}.json`, JSON.stringify(allFolderPaths.data, null, 4), function(err, result) {
      if(err) console.error(colors.red(`Error: can't create meta file`));
    });
    return {status: true, data: allFolderPaths.data, message: allFolderPaths.message}
  }
}

function getSetting(itemPath, userName){
    let itemSelectedJsonRead = {}
    const itemSelectedJsonPath = `${itemPath.split(".bmp").shift()}.json`
    try {
        const readItemJsonFile = fs.readFileSync(itemSelectedJsonPath); 
        if (Object.keys(JSON.parse(readItemJsonFile).labels).includes(userName)) {
          itemSelectedJsonRead = readItemJsonFile;
        } else {
          itemSelectedJsonRead = createDefaultTagForUserInJsonFile({basicTagUsers: JSON.parse(readItemJsonFile).labels, userName});
        }
    } catch (error) {
      itemSelectedJsonRead = createDefaultTagForUserInJsonFile({userName});
    }
    return JSON.parse(itemSelectedJsonRead);
}

function setSetting(createJsonFileValue){
    const { value, userName, index} = createJsonFileValue;
    let response = {
      status: true,
      message: "success",
    };
    if (value) {
      const itemSelected = AllRecords.getRecord(index)
      const readJson = getSetting(itemSelected.path, userName);
      const ItemSelectedJsonNewData = {
          labels: {
              ...readJson.labels,
              [userName]: value,
          },
      }
      const writePath = `${itemSelected.path.split(".bmp").shift()}.json`;
      fs.writeFile(writePath, JSON.stringify(ItemSelectedJsonNewData, null, 4), function(err, result) {
        if(err) {
          response = {
            status: false,
            message: "can't save record!!! (try again)",
          };
        }
      });
    }

    return response;
}

function extractImage(hasItem){
    const {path, name} = hasItem;
    return dynamicImport(Configs.getMode()).getRecordMode(path, name);
    
}

module.exports = {
  createAndCheckExistConfigFile,
  checkExistLabelsFile,
  // lastIndexSeenByAnyUser,
  scanDirectory,
  getSetting,
  setSetting,
  extractImage,
}
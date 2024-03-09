const fs = require("fs");
const {Configs, AllRecords} = require("./singelton-db")

// const { scanDirectoryConditional } = require("./general-utils")

const createAndCheckExistConfigFile = () => {
  try { 
    const readConfig = fs.readFileSync(`.\\config.json`);
    const parseConfig = JSON.parse(readConfig);
    Configs.setMode(parseConfig.mode)
    Configs.setDirectory(parseConfig.baseDirectory);
  } catch (error) {
    const newConfig = {
      baseDirectory: "",
      mode: "file",
    }
    Configs.setMode("")
    Configs.setDirectory("file");
    fs.writeFile(`./config.json`, JSON.stringify(newConfig, null, 4), function(err, result) {
      if(err) console.log(err)
    });
  }
}

const checkExistLabelsFile = (res) => {
  try {    
    fs.readFileSync(`${Configs.getDirectory()}\\tags.json`);
  } catch (error) {
    res.send({status: false, message: "label file not found"})
    throw new Error("labels json file not found")
  }
}

// function scanDirectory(res, newConfig){
//   try {
//     const dataBase = fs.readFileSync(`${newConfig.baseDirectory}\\data_base.json`)
//     return JSON.parse(dataBase);
//   } catch (error) {
//     let allFolderPaths = scanDirectoryConditional({newConfig, res});
//     if (Object.keys(allFolderPaths).length) {
//       fs.writeFile(`${newConfig.baseDirectory}\\data_base.json`, JSON.stringify(allFolderPaths, null, 4), function(err, result) {
//         if(err) return {status: false, message: "cant create json file"}
//       });
//     }
//     return allFolderPaths;
//   }
// }

const setIndex = (userData, value) => {
  let index = "0";
  if (userData && userData[Configs.getDirectory()]) {
    if (value) {
      index = userData[Configs.getDirectory()];
    } else {
      index = String(parseInt(userData[Configs.getDirectory()]));
    }
  }
  return index;
}

module.exports = {
  createAndCheckExistConfigFile,
  checkExistLabelsFile,
  // scanDirectory,
  setIndex,
}









// let counter = 0;
//     let allFolderPaths = {};
    
//     function walkDir(rootDirectory) {
//       //   try {
//           const fNamesInRoot = fs.readdirSync(rootDirectory);
//           fNamesInRoot.forEach(fNameInRoot => {
//             const fPathInRoot = path.join(rootDirectory, fNameInRoot);
//             a = 5
//             allFolderPaths = scanDirectoryConditional({counter, fPathInRoot, fNameInRoot, walkDir})
//           });
//       //   } catch (error) {
//       //     Configs.directory = "";
//       //     Configs.mode = "";
//       //     // return res.status(404).json({status: false, message: "directory not found"});
//       //   }
//       }

//       walkDir(newConfig.baseDirectory);
  
//       fs.writeFile(`${newConfig.baseDirectory}\\data_base.json`, JSON.stringify(allFolderPaths, null, 4), function(err, result) {
//         if(err) return {status: false, message: "cant create json file"}
//       });
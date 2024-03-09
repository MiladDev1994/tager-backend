const fs = require("fs");
const path = require("path");
const {Configs} = require("./singelton-db")


function scanDirectoryMode(){
  let counter = 0;
  let allFolderPaths = {
    status: true,
    data: {},
    message: "",
  };

  function walkDir(rootDirectory) {
    try {
      const fNamesInRoot = fs.readdirSync(rootDirectory);
      fNamesInRoot.forEach(fNameInRoot => {
        const fPathInRoot = path.join(rootDirectory, fNameInRoot);
        if (fs.statSync(fPathInRoot).isDirectory()) {
          return walkDir(fPathInRoot)
        } else {
          if (fPathInRoot.includes(".bmp")) {
              counter++;
              allFolderPaths.data[counter] = {path: fPathInRoot, name: fNameInRoot};
          }
        }
      })
    } catch (error) {
      Configs.setDirectory(""); 
      Configs.setMode("file");
      allFolderPaths = {
        status: false,
        message: "directory not found"
      }
    }
  }

  walkDir(Configs.getDirectory());

  return allFolderPaths;
}

function getRecordMode(route){
  let images = []
  const image = fs.readFileSync(route);
  images = [{
    name: image,
    data: image.toString("base64")
  }];
  
  return images;
}

module.exports = {
  scanDirectoryMode, 
  getRecordMode, 
};

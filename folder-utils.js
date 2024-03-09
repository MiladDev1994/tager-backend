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
          const fNamesInCurrentDirectory = fs.readdirSync(fPathInRoot);
          
          if (fNamesInCurrentDirectory.includes("DOWN_CAM_doc.xml") || fNamesInCurrentDirectory.includes("TOP_CAM_doc.xml")) {
              counter++
              allFolderPaths.data[counter] = {path: fPathInRoot, name: fNameInRoot};
          } else {
            walkDir(fPathInRoot)
          } 
        }
      });
      
    } catch (error) {
      Configs.setDirectory(""); 
      Configs.setMode("file");
      allFolderPaths = {
        status: false,
        message: "directory not found"
      }
    }
  }

  walkDir(Configs.getDirectory())

  return allFolderPaths;
}

function getRecordMode(route, name){
  let images = []
  const directory = fs.readdirSync(route)
  const bmp = directory.filter(item => item.includes(".bmp"))
  
  bmp.forEach((f) => {
    const imagePath = path.join(route, f)
    const image = fs.readFileSync(imagePath);
    images.push({
      name: name,
      data: image.toString("base64")
    })
  });

  return images;
}

module.exports = {
  scanDirectoryMode, 
  getRecordMode, 
};
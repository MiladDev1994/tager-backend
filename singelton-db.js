let allRecordsInstance;
let configsInstance;
let labelsInstance;


class AllRecordsClass{
  constructor(records) {
    if (allRecordsInstance) {
      throw new Error("You can only create one instance!");
    }
    this.records = records;
    
    allRecordsInstance = this;
  }

  getRecord(record_id) {
    return this.records[record_id];
  }

  setRecordNull(record_id) {
    const baseRecord = {...this.records};
    baseRecord[record_id] = null;
    return this.records = baseRecord
  }

  setAllRecords(records) {
    return this.records = records;
  }

  getAllRecords() {
    return this.records;
  }

  getAllRecordLength() {
    return Object.keys(this.records).length;
  }
}


class ConfigsClass{
  constructor(mode, directory) {
    if (configsInstance) {
      throw new Error("You can only create one instance!");
    }
    this.mode = mode;
    this.directory = directory;
    configsInstance = this;
  }

  getMode() {
    return this.mode;
  }

  setMode(mode) {
    return this.mode = mode;
  }

  getDirectory() {
    return this.directory
  }
  
  setDirectory(directory) {
    return this.directory = directory
  }
  
}


class LabelsClass{
  constructor(labels) {
    if (labelsInstance) {
      throw new Error("You can only create one instance!");
    }
    this.labels = labels;

    labelsInstance = this;
  }

  getLabel() {
    return this.labels
  }

  setLabel(labels) {
    return this.labels = labels;
  }
}


const AllRecords = new AllRecordsClass();
const Configs    = new ConfigsClass();
const Labels     = new LabelsClass();

module.exports = {
  AllRecords,
  Configs,
  Labels
};

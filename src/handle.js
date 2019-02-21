const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');

const ExtractFile = require('./ExtractFile.js');
const excel2json = require('./excel2json');
const json2excel = require('./json2excel');
const mergeJson = require('./mergeObject');
const { COMMAD, questions } = require('./util/config');

let cwd = process.cwd();
let configFilepath = path.join(cwd, 'b28.config.js'),
    config = {};
console.log('读取配置···');
if (fs.existsSync(configFilepath)) {
    config = require(configFilepath);
} else {
    config = getCfg();
}

function getCfg() {

}
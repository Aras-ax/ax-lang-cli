const { loadJson, writeExcel } = require('./util/index');
const path = require('path');

function json2excel(jsonPath, outPath) {
    let data = loadJson(jsonPath),
        exceldata = [
            ['EN', 'CN']
        ];

    for (let key in data) {
        exceldata.push([key, data[key]]);
    }

    return writeExcel(data, path.join(outPath, 'lang.excel'), 'EN-CN');
}

module.exports = json2excel;
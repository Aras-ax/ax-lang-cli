const ExtractFile = require('./ExtractFile.js');
const excel2json = require('./excel2json');
const json2excel = require('./json2excel');
const mergeJson = require('./mergeObject');

let extract = new ExtractFile({
    baseReadPath: 'D:\\Git\\translate\\test\\TestFile\\getLanSimple',
    baseWritePath: 'D:\\Git\\translate\\test\\TestFile\\output',
    onlyZH: true,
    isTranslate: false,
    CONFIG_HONG: {},
    transWords: data
});

extract.scanFile();
// return;

// excel2json({
//     excelPath: 'D:\\Git\\translate\\test\\TestFile\\output\\词条EN.xlsx',
//     sheetName: '',
//     outPath: 'D:\\Git\\translate\\test\\TestFile\\getLanSimpleData',
//     fileName: 'en.json',
//     key: 'CN'
// });
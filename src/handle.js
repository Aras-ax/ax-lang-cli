const ExtractFile = require('./ExtractFile.js');
const excel2json = require('./excel2json');
const json2excel = require('./json2excel');
const mergeJson = require('./mergeObject');

// let extract = new ExtractFile({
//     baseReadPath: 'D:\\Git\\translate\\test\\TestFile\\getLanSimple',
//     baseWritePath: 'D:\\Git\\translate\\test\\TestFile\\output',
//     onlyZH: true,
//     isTranslate: false,
//     config_hong_path: {},
//     transWords: data
// });

// extract.scanFile();
// return;

// excel2json({
//     excelPath: 'D:\\Git\\translate\\test\\TestFile\\output\\词条EN.xlsx',
//     sheetName: '',
//     outPath: 'D:\\Git\\translate\\test\\TestFile\\getLanSimpleData',
//     fileName: 'en.json',
//     key: 'CN'
// });

// let extract = new ExtractFile({
//     baseReadPath: 'D:\\Git\\translate\\test\\TestFile\\simpleTest\\html',
//     baseWritePath: 'D:\\Git\\translate\\test\\TestFile\\output',
//     onlyZH: false,
//     isTranslate: false,
//     config_hong_path: 'D:\\Git\\translate\\test\\TestFile\\config\\macro_config.js',
//     transWords: {}
// });

// extract.scanFile().then(data => {
//     let t = 1;
// });

excel2json({
    excelPath: 'D:\\Git\\translate\\test\\TestFile\\simpleTestData\\repeat.xlsx',
    outPath: 'D:\\Git\\translate\\test\\TestFile\\output',
    sheetName: '',
    key: 'EN',
    value: 'CN,ZH'
})
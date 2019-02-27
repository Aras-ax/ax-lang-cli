const start = require('../src/index');
const { COMMAD } = require('../src/util/config');

const hongPath = './test/TestFile/config/index.js';

start({
    commandType: COMMAD.GET_WORDS,
    baseReadPath: './test/TestFile/test/ejs',
    baseOutPath: './test/TestFile/output/ejs',
    hongPath
}).then(data => {
    let t = data;
});

// start({
//     commandType: COMMAD.GET_WORDS,
//     baseReadPath: './test/TestFile/test/allTest',
//     baseOutPath: './test/TestFile/output/allTest',
//     hongPath
// }).then(data => {
//     let t = data;
// });

// start({
//     commandType: COMMAD.TRANSLATE,
//     baseTranslatePath: './test/TestFile/test/allTest',
//     baseTransOutPath: './test/TestFile/output/allTest',
//     languagePath: './test/TestFile/testData/allTest/translate.xlsx',
//     hongPath,
//     sheetName: '',
//     keyName: 'CN',
//     valueName: 'EN'
// }).then(data => {
//     let t = '';
// });

// start({
//     commandType: COMMAD.CHECK_TRANSLATE,
//     baseCheckPath: './test/TestFile/testData/allTest/translate',
//     langJsonPath: './test/TestFile/testData/allTest/translate/lang.json',
//     hongPath,
//     logPath: './test/TestFile/output/allTest/test'
// }).then(data => {
//     let t = '';
// });

// start({
//     commandType: COMMAD.JSON_TO_EXCEL,
//     jsonPath: './test/TestFile/testData/onlyZH.json',
//     outExcelPath: './test/TestFile/output/test1.xlsx'
// })

// start({
//     commandType: COMMAD.MERGE_JSON,
//     mainJsonPath: 'D:/Git/translate/test/TestFile/testData/lang/CN.json',
//     mergeJsonPath: 'D:/Git/translate/test/TestFile/testData/lang/ZH.json',
//     outMergeJsonPath: ''
// }).then(data => {
//     // return expect(data).toEqual(words);
// });

// start();
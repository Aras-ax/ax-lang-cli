const start = require('../src/index');
const { COMMAD } = require('../src/util/config');

const hongPath = './test/TestFile/config/macro_config.js';

// start({
//     commandType: COMMAD.GET_WORDS,
//     baseReadPath: './test/TestFile/simpleTest/allTest',
//     baseOutPath: './test/TestFile/output/allTest',
//     hongPath
// }).then(data => {
//     let t = data;
// });

// start({
//     commandType: COMMAD.TRANSLATE,
//     baseTranslatePath: './test/TestFile/simpleTest/allTest',
//     baseTransOutPath: './test/TestFile/output/allTest',
//     languagePath: './test/TestFile/simpleTestData/allTest/translate.xlsx',
//     hongPath,
//     sheetName: '',
//     keyName: 'CN',
//     valueName: 'EN'
// }).then(data => {
//     let t = '';
// });

// start({
//     commandType: COMMAD.CHECK_TRANSLATE,
//     baseCheckPath: './test/TestFile/simpleTestData/allTest/translate',
//     langJsonPath: './test/TestFile/simpleTestData/allTest/translate/lang.json',
//     hongPath,
//     logPath: './test/TestFile/output/allTest/test'
// }).then(data => {
//     let t = '';
// });

// start({
//     commandType: COMMAD.JSON_TO_EXCEL,
//     jsonPath: './test/TestFile/simpleTestData/onlyZH.json',
//     outExcelPath: './test/TestFile/output/test1.xlsx'
// })
const start = require('../src/index');
const { COMMAD } = require('../src/util/config');

const hongPath = 'D:\\Git\\translate\\test\\TestFile\\config\\macro_config.js';

// start({
//     commandType: COMMAD.GET_WORDS,
//     baseReadPath: 'D:\\Git\\translate\\test\\TestFile\\simpleTest\\allTest',
//     baseOutPath: 'D:\\Git\\translate\\test\\TestFile\\output\\allTest',
//     hongPath
// }).then(data => {
//     let t = data;
// });

// start({
//     commandType: COMMAD.TRANSLATE,
//     baseTranslatePath: 'D:\\Git\\translate\\test\\TestFile\\simpleTest\\allTest',
//     baseTransOutPath: 'D:\\Git\\translate\\test\\TestFile\\output\\allTest',
//     languagePath: 'D:/Git/translate/test/TestFile/simpleTestData/allTest/translate.xlsx',
//     hongPath,
//     sheetName: '',
//     keyName: 'CN',
//     valueName: 'EN'
// }).then(data => {
//     let t = '';
// });

// start({
//     commandType: COMMAD.CHECK_TRANSLATE,
//     baseCheckPath: 'D:\\Git\\translate\\test\\TestFile\\simpleTestData\\allTest\\translate',
//     langJsonPath: 'D:\\Git\\translate\\test\\TestFile\\simpleTestData\\allTest\\translate\\lang.json',
//     hongPath,
//     logPath: 'D:\\Git\\translate\\test\\TestFile\\output\\allTest\\test'
// }).then(data => {
//     let t = '';
// });

start({
    commandType: COMMAD.JSON_TO_EXCEL,
    jsonPath: 'D:\\Git\\translate\\test\\TestFile\\simpleTestData\\onlyZH.json',
    outExcelPath: 'D:\\Git\\translate\\test\\TestFile\\output\\test1.xlsx'
})
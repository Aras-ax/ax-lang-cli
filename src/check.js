import start from './index';
import { COMMAD } from './util/config';

const hongPath = './test/TestFile/config/index.js';
// import arrayToJson from './arrayToJson';
module.exports = function() {
    // start({
    //     commandType: COMMAD.GET_WORDS,
    //     baseReadPath: './test/TestFile/test/js',
    //     baseOutPath: './test/TestFile/output/js',
    //     hongPath
    // }).then(data => {
    //     let t = data;
    // });

    // start({
    //     commandType: COMMAD.GET_WORDS,
    //     baseReadPath: './test/Pro/app/test',
    //     baseOutPath: './test/TestFile/output/allTest',
    //     hongPath
    // }).then(data => {
    //     let t = data;
    // });

    // start({
    //     commandType: COMMAD.GET_WORDS,
    //     baseReadPath: 'C:/Users/moshang/Desktop/src',
    //     baseOutPath: 'C:/Users/moshang/Desktop/srcOut',
    //     hongPath: ''
    // }).then(data => {
    //     let t = data;
    // });

    // arrayToJson('C:/Users/moshang/Desktop/srcOut/lang1.json', 'C:/Users/moshang/Desktop/srcOut/lang.json', 'C:/Users/moshang/Desktop/srcOut/t.json');

    // start({
    //     commandType: COMMAD.JSON_TO_EXCEL,
    //     jsonPath: 'C:/Users/moshang/Desktop/srcOut/t.json',
    //     outExcelPath: ''
    // });

    // start({
    //     commandType: COMMAD.GET_WORDS,
    //     baseReadPath: './test/TestFile/test/allTest',
    //     baseOutPath: './test/TestFile/output/allTest',
    //     hongPath
    // }).then(data => {
    //     let t = data;
    // });
    // start({
    //     commandType: COMMAD.GET_WORDS,
    //     baseReadPath: './test/TestFile/test/js',
    //     baseOutPath: './test/TestFile/output/js',
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
    //     keyName: 'EN',
    //     valueName: 'CN'
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
    //     commandType: COMMAD.TRANSLATE,
    //     baseTranslatePath: './test/TestFile/test/html',
    //     baseTransOutPath: './test/TestFile/output/html',
    //     languagePath: './test/TestFile/testData/allTest/translate.xlsx',
    //     hongPath,
    //     sheetName: '',
    //     keyName: 'EN',
    //     valueName: 'CN'
    // }).then(data => {
    //     let t = '';
    // });

    // start({
    //     commandType: COMMAD.JSON_TO_EXCEL,
    //     jsonPath: './test/TestFile/testData/onlyZH.json',
    //     outExcelPath: './test/TestFile/output/test1.xlsx'
    // })

    start({
        commandType: COMMAD.MERGE_JSON,
        mainJsonPath: './test/TestFile/testData/merge/cn.json',
        mergeJsonPath: './test/TestFile/testData/merge/en.json',
        action: 2,
        outMergeJsonPath: './test/TestFile/testData/merge2'
    });

    start({
        commandType: COMMAD.MERGE_JSON,
        mainJsonPath: './test/TestFile/testData/merge/cn.json',
        mergeJsonPath: './test/TestFile/testData/merge/en.json',
        action: 1,
        outMergeJsonPath: './test/TestFile/testData/merge1'
    });

    // start();



    //     start({
    //         commandType: COMMAD.ORIGINAL_CODE,
    //         // baseReadPath: './test/TestFile/origin',
    //         // baseOutPath: './test/TestFile/output/origin'
    //         baseReadPath: 'C:/Users/lenovo/Desktop/添加翻译函数/webs',
    //         baseOutPath: 'C:/Users/lenovo/Desktop/添加翻译函数/websAfter'
    //     }).then(data => {
    //         // return expect(data).toEqual(words);
    //     });
}
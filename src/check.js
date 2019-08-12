import start from './index';
import { COMMAD } from './util/config';

const hongPath = './test/TestFile/config/index.js';

// import arrayToJson from './arrayToJson';

function getWords() {
    start({
        commandType: COMMAD.GET_WORDS,
        baseReadPath: './test/TestFile/test/js',
        baseOutPath: './test/TestFile/output/js',
        hongPath
    }).then(data => {
        let t = data;
    });

    // start({
    //     commandType: COMMAD.GET_WORDS,
    //     baseReadPath: 'C:/Users/moshang/Desktop/src',
    //     baseOutPath: 'C:/Users/moshang/Desktop/srcOut',
    //     hongPath: ''
    // }).then(data => {
    //     let t = data;
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
}

function translate() {
    start({
        commandType: COMMAD.TRANSLATE,
        baseTranslatePath: './test/TestFile/test/allTest',
        baseTransOutPath: './test/TestFile/output/allTest',
        languagePath: './test/TestFile/testData/allTest/translate.xlsx',
        hongPath,
        sheetName: '',
        keyName: 'EN',
        valueName: 'CN'
    }).then(data => {
        let t = '';
    });

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
}

function check() {
    // start({
    //     commandType: COMMAD.CHECK_TRANSLATE,
    //     baseCheckPath: './test/TestFile/testData/allTest/translate',
    //     langJsonPath: './test/TestFile/testData/allTest/translate/lang.json',
    //     hongPath,
    //     logPath: './test/TestFile/output/allTest/test'
    // }).then(data => {
    //     let t = '';
    // });
}

function json2excel() {
    // start({
    //     commandType: COMMAD.JSON_TO_EXCEL,
    //     jsonPath: 'C:/Users/moshang/Desktop/srcOut/t.json',
    //     outExcelPath: ''
    // });

    start({
        commandType: COMMAD.JSON_TO_EXCEL,
        jsonPath: './test/TestFile/testData/onlyZH.json',
        outExcelPath: './test/TestFile/output/test1.xlsx'
    })
}

function merge() {
    start({
        commandType: COMMAD.MERGE_JSON,
        mainJsonPath: './test/TestFile/testData/merge/cn.json',
        mergeJsonPath: './test/TestFile/testData/merge/en.json',
        action: 2,
        outMergeJsonPath: './test/TestFile/testData/merge2'
    });
}

function mergePart() {
    start({
        commandType: COMMAD.MERGE_JSON,
        mainJsonPath: './test/TestFile/testData/merge/cn.json',
        mergeJsonPath: './test/TestFile/testData/merge/en.json',
        action: 1,
        outMergeJsonPath: './test/TestFile/testData/merge1'
    });
}

function origin() {
    start({
        commandType: COMMAD.ORIGINAL_CODE,
        baseProPath: './test/TestFile/origin',
        baseProOutPath: './test/TestFile/output/origin'
    }).then(data => {
        // return expect(data).toEqual(words);
    });
}

function vueGet() {
    start({
        commandType: COMMAD.GET_WORDS,
        // baseReadPath: './test/vue/get',
        // baseReadPath: './test/vue/error',
        baseReadPath: 'C:/Users/lenovo/Desktop/test',
        baseOutPath: 'C:/Users/lenovo/Desktop/output',
        // baseOutPath: './test/vue/output',
        hongPath
    }).then(data => {
        let t = data;
    });
}

function vueTrans() {
    start({
        commandType: COMMAD.TRANSLATE,
        baseTranslatePath: './test/vue/get',
        baseTransOutPath: './test/vue/transout',
        languagePath: './test/vue/lang/en-cn.xlsx',
        hongPath,
        sheetName: '',
        keyName: 'EN',
        valueName: 'CN'
    }).then(data => {
        let t = data;
    });
}
module.exports = function() {
    vueTrans();
    // origin();
}
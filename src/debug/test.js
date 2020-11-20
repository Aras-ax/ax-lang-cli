import start from "../index";
import { COMMAD } from "../util/config";

const hongPath = "../../test/TestFile/config/index.js";

// import arrayToJson from './arrayToJson';

function getWords() {
  start({
    commandType: COMMAD.GET_WORDS,
    baseReadPath: "C:/Users/lenovo/Desktop/trans",
    baseOutPath: "C:/Users/lenovo/Desktop/trans",
    hongPath
  }).then((data) => {
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
    baseTranslatePath: "./test/TestFile/test/allTest",
    baseTransOutPath: "./test/TestFile/output/allTest",
    languagePath: "./test/TestFile/testData/allTest/translate.xlsx",
    hongPath,
    sheetName: "",
    keyName: "EN",
    valueName: "CN"
  }).then((data) => {
    let t = "";
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
  start({
    commandType: COMMAD.CHECK_TRANSLATE,
    baseCheckPath: "D:/project/AC系列/AC6V4.0-LNK01/AC5_cn_normal_src",
    langJsonPath: "C:/Users/lenovo/Desktop/out/t.json",
    hongPath,
    logPath: "C:/Users/lenovo/Desktop/out"
  }).then((data) => {
    let t = "";
  });
}

function json2excel() {
  start({
    commandType: COMMAD.JSON_TO_EXCEL,
    jsonPath: "./test/TestFile/testData/onlyZH.json",
    outExcelPath: "./test/TestFile/output/test1.xlsx"
  });
}

function merge() {
  start({
    commandType: COMMAD.MERGE_JSON,
    mainJsonPath: "./test/TestFile/testData/merge/cn.json",
    mergeJsonPath: "./test/TestFile/testData/merge/en.json",
    action: 2,
    outMergeJsonPath: "./test/TestFile/testData/merge2"
  });
}

function mergePart() {
  start({
    commandType: COMMAD.MERGE_JSON,
    mainJsonPath: "./test/TestFile/testData/merge/cn.json",
    mergeJsonPath: "./test/TestFile/testData/merge/en.json",
    action: 1,
    outMergeJsonPath: "./test/TestFile/testData/merge1"
  });
}

function origin() {
  start({
    commandType: COMMAD.ORIGINAL_CODE,
    baseProPath: "./test/TestFile/origin",
    baseProOutPath: "./test/TestFile/output/origin"
  }).then((data) => {
    // return expect(data).toEqual(words);
  });
}

function vueGet() {
  start({
    commandType: COMMAD.GET_WORDS,
    // baseReadPath: './test/vue/get',
    // baseReadPath: './test/vue/error',
    baseReadPath: "C:/Users/lenovo/Desktop/test",
    baseOutPath: "C:/Users/lenovo/Desktop/output",
    // baseOutPath: './test/vue/output',
    hongPath
  }).then((data) => {
    let t = data;
  });
}

function vueTrans() {
  start({
    commandType: COMMAD.TRANSLATE,
    baseTranslatePath: "./test/vue/get",
    baseTransOutPath: "./test/vue/transout",
    languagePath: "./test/vue/lang/en-cn.xlsx",
    hongPath,
    sheetName: "",
    keyName: "EN",
    valueName: "CN"
  }).then((data) => {
    let t = data;
  });
}

function translateJs() {
  start({
    commandType: COMMAD.TRANSLATE,
    baseTranslatePath: "./test/TestFile/test/js",
    baseTransOutPath: "./test/TestFile/output/js",
    languagePath: "./test/TestFile/output/js/translate.xlsx",
    hongPath,
    sheetName: "",
    keyName: "EN",
    valueName: "CN"
  }).then((data) => {
    let t = "";
  });
}

function getAllSrc() {
  start({
    commandType: COMMAD.GET_WORDS,
    baseReadPath: "C:/Users/lenovo/Desktop/trans/src",
    baseOutPath: "C:/Users/lenovo/Desktop/trans/out",
    hongPath
  }).then((data) => {
    let t = data;
  });
}

function transAllFile() {
  start({
    commandType: COMMAD.TRANS_ENCODE,
    transFilePath: "C:/Users/lenovo/Desktop/trans/out",
    transOutPath: "C:/Users/lenovo/Desktop/trans/out"
  }).then((data) => {
    let t = data;
  });
}

module.exports = function () {
  let command = "getLan";
  switch (command) {
    case "check":
      check();
      break;
    case "excel2json":
      start({
        commandType: COMMAD.EXCEL_TO_JSON,
        keyName: "EN",
        valueName: "CN",
        excelPath: "C:/Users/lenovo/Desktop/mw6.xlsx",
        outJsonPath: "C:/Users/lenovo/Desktop"
      });
      break;
    case "trans":
      start({
        commandType: COMMAD.TRANSLATE,
        baseTranslatePath: "C:/Users/lenovo/Desktop/transTest/error/src",
        baseTransOutPath: "C:/Users/lenovo/Desktop/transTest/error/out",
        languagePath: "C:/Users/lenovo/Desktop/transTest/error/lan.xlsx",
        hongPath: "",
        sheetName: "",
        keyName: "EN",
        valueName: "CN"
      });
      // start({
      //   commandType: COMMAD.TRANSLATE,
      //   baseTranslatePath: "C:/Users/lenovo/Desktop/transTest/src",
      //   baseTransOutPath: "C:/Users/lenovo/Desktop/transTest/out",
      //   languagePath: "C:/Users/lenovo/Desktop/transTest/lan.xlsx",
      //   hongPath: "",
      //   sheetName: "",
      //   keyName: "EN",
      //   valueName: "CN"
      // });
      break;
    case "getLan":
      // start({
      //   commandType: COMMAD.GET_WORDS,
      //   // onlyZH: true,
      //   baseReadPath: "C:/Users/lenovo/Desktop/ts/src",
      //   baseOutPath: "C:/Users/lenovo/Desktop/ts"
      // });
      start({
        commandType: COMMAD.TRANSLATE,
        baseTranslatePath: "C:/Users/lenovo/Desktop/ts/src",
        baseTransOutPath: "C:/Users/lenovo/Desktop/ts/out",
        languagePath: "C:/Users/lenovo/Desktop/ts/提取词条EN.xlsx",
        hongPath: "",
        sheetName: "",
        keyName: "CN",
        valueName: "EN"
      });
      break;
  }
};

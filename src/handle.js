import path from "path";

import ExtractFile from "./ExtractFile.js";
import ExtractOri from "./ExtractFileOrigin.js";
import excel2json from "./excel2json";
import json2excel from "./json2excel";
import mergeJson from "./mergeJson";
import checkLangExcel from "./checkLangExcel";
import ExtractLangExcel from "./ExtractLangExcel";
import transEncode from "./encode";
import { COMMAD } from "./util/config";
import { loadJsonSync, string2Regexp } from "./util/index";

function handle(cfg) {
  switch (cfg.commandType) {
    case COMMAD.GET_WORDS:
      return getWords(cfg);
    case COMMAD.TRANSLATE:
      return translate(cfg);
    case COMMAD.CHECK_TRANSLATE:
      return check(cfg);
    case COMMAD.EXCEL_TO_JSON:
      return excelToJson(cfg);
    case COMMAD.JSON_TO_EXCEL:
      return jsonToExcel(cfg);
    case COMMAD.MERGE_JSON:
      return merge(cfg);
    case COMMAD.ORIGINAL_CODE:
      let ignoreCode = cfg.ignoreCode,
        templateExp = cfg.templateExp;

      if (ignoreCode) {
        cfg.ignoreCode = string2Regexp(ignoreCode);
      }

      if (templateExp) {
        cfg.templateExp = string2Regexp(templateExp);
      }
      return addTrans(cfg);
    case COMMAD.CHECK_LANGEXCEL:
      return checkExcel(cfg);
    case COMMAD.GET_ALLWORDS:
      return getAllWords(cfg);
    case COMMAD.TRANS_ENCODE:
      return transEncode(cfg.transFilePath, cfg.transOutPath, cfg.transEncode);
  }

  return Promise.resolve("没有匹配的操作");
}

function addTrans(cfg) {
  let extractOri = new ExtractOri({
    baseReadPath: cfg.baseProPath,
    baseWritePath: cfg.baseProOutPath,
    ignoreCode: cfg.ignoreCode,
    templateExp: cfg.templateExp
  });
  return extractOri.scanFile();
}

function getWords(cfg) {
  let extract = new ExtractFile({
    baseReadPath: cfg.baseReadPath,
    baseWritePath: cfg.baseOutPath,
    onlyZH: cfg.onlyZH,
    hongPath: cfg.hongPath,
    writeExcel: true,
    needFilePath: true
  });
  return extract.scanFile();
}

/**
 * 翻译的同时生成语言包
 * 翻译时的key列永远是CN，Value列永远是EN
 */
function translate(cfg) {
  let extract;

  // 通过JSON文件直接翻译
  if (path.extname(cfg.languagePath) === ".json") {
    let langData = loadJsonSync(cfg.languagePath);
    extract = new ExtractFile({
      baseReadPath: cfg.baseTranslatePath,
      baseWritePath: cfg.baseTransOutPath,
      isTranslate: true,
      hongPath: cfg.hongPath,
      transWords: langData
    });
    // extract.setAttr('transWords', langData);
    return extract.scanFile();
  } else {
    // 通过Excel文件翻译，并生成语言包JSON
    return excel2json({
      excelPath: cfg.languagePath,
      outPath: cfg.baseTransOutPath,
      sheetName: cfg.sheetName,
      key: cfg.keyName,
      value: "ALL"
    }).then(data => {
      let langData = {};
      data = data[cfg.valueName.toUpperCase() || "CN"];
      for (let key in data) {
        langData[data[key]] = key;
      }

      extract = new ExtractFile({
        baseReadPath: cfg.baseTranslatePath,
        baseWritePath: cfg.baseTransOutPath,
        isTranslate: true,
        hongPath: cfg.hongPath,
        transWords: langData
      });
      // extract.setAttr('transWords', langData);
      return extract.scanFile();
    });
  }
}

function check(cfg) {
  // 通过JSON文件直接翻译
  let langData = loadJsonSync(cfg.langJsonPath);

  let extract = new ExtractFile({
    baseReadPath: cfg.baseCheckPath,
    baseWritePath: cfg.logPath,
    hongPath: cfg.hongPath,
    isCheckTrans: true,
    transWords: langData
  });

  return extract.scanFile();
}

function excelToJson(cfg) {
  return excel2json({
    excelPath: cfg.excelPath,
    outPath: cfg.outJsonPath,
    sheetName: cfg.sheetName,
    key: cfg.keyName,
    value: cfg.valueName
  });
}

function jsonToExcel(cfg) {
  return json2excel(cfg.jsonPath, cfg.outExcelPath);
}

function merge(cfg) {
  return mergeJson(
    cfg.mainJsonPath,
    cfg.mergeJsonPath,
    cfg.outMergeJsonPath,
    cfg.action
  );
}

function checkExcel(cfg) {
  return checkLangExcel({
    outExcel: cfg.outExcel,
    inExcel: cfg.inExcel,
    sheetName1: cfg.sheetName1,
    keyName1: cfg.keyName1,
    sheetName2: cfg.sheetName2,
    keyName2: cfg.keyName2
  });
}

function getAllWords(cfg) {
  let extract = new ExtractFile({
    jsonPath: cfg.languagePath,
    baseReadPath: cfg.baseReadPath,
    baseWritePath: cfg.baseOutPath,
    onlyZH: false,
    hongPath: cfg.hongPath,
    writeExcel: false,
    needFilePath: false
  });
  extract.scanFile().then(words => {
    ExtractLangExcel(words, cfg.languagePath, cfg.baseOutPath).catch(error =>
      console.log(error.message)
    );
  });
}

export default handle;

import path from 'path';

import ExtractFile from './ExtractFile.js';
import ExtractOri from './ExtractFileOrigin.js';
import excel2json from './excel2json';
import json2excel from './json2excel';
import mergeJson from './mergeJson';
import { COMMAD } from './util/config';
import { loadJsonSync, string2Regexp } from './util/index';

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
                ignoreExp = cfg.ignoreExp;

            if (ignoreCode) {
                cfg.ignoreCode = string2Regexp(ignoreCode);
            }

            if (ignoreExp) {
                cfg.ignoreExp = string2Regexp(ignoreExp);
            }
            return addTrans(cfg);
    }

    return Promise.resolve('没有匹配的操作');
}

function addTrans(cfg) {
    let extractOri = new ExtractOri({
        baseReadPath: cfg.baseProPath,
        baseWritePath: cfg.baseProOutPath,
        ignoreCode: cfg.ignoreCode,
        ignoreExp: cfg.ignoreExp
    });
    return extractOri.scanFile();
}

function getWords(cfg) {
    let extract = new ExtractFile({
        baseReadPath: cfg.baseReadPath,
        baseWritePath: cfg.baseOutPath,
        onlyZH: cfg.onlyZH,
        config_hong_path: cfg.hongPath
    });

    return extract.scanFile();
}

/**
 * 翻译的同时生成语言包
 * 翻译时的key列永远是CN，Value列永远是EN
 */
function translate(cfg) {
    let extract = new ExtractFile({
        baseReadPath: cfg.baseTranslatePath,
        baseWritePath: cfg.baseTransOutPath,
        isTranslate: true,
        config_hong_path: cfg.hongPath,
        transWords: {}
    });

    // 通过JSON文件直接翻译
    if (path.extname(cfg.languagePath) === '.json') {
        let langData = loadJsonSync(cfg.languagePath);

        extract.setAttr('transWords', langData);
        return extract.scanFile();
    } else {
        // 通过Excel文件翻译，并生成语言包JSON
        return excel2json({
            excelPath: cfg.languagePath,
            outPath: cfg.baseTransOutPath,
            sheetName: cfg.sheetName,
            key: cfg.keyName,
            value: 'ALL'
        }).then(data => {
            let langData = {};
            data = data[cfg.valueName.toUpperCase() || 'CN'];
            for (let key in data) {
                langData[data[key]] = key;
            }
            extract.setAttr('transWords', langData);
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
        config_hong_path: cfg.hongPath,
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
    return mergeJson(cfg.mainJsonPath, cfg.mergeJsonPath, cfg.outMergeJsonPath);
}

export default handle;
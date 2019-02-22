const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');

const ExtractFile = require('./ExtractFile.js');
const excel2json = require('./excel2json');
const json2excel = require('./json2excel');
const mergeJson = require('./mergeObject');
const { COMMAD, questions, baseQuestions, COMMAD_TEXT, validate } = require('./util/config');
const { getDirname } = require('./util/index');

let cwd = process.cwd();
let configFilepath = path.join(cwd, 'b281.config.js'),
    config = {};
console.log('读取配置···');

// todo by xc 
// 添加所有的配置以参数的形式一起传进来
if (fs.existsSync(configFilepath)) {
    config = require(configFilepath);

    correctCfg(config).then(data => {
        handle(data);
    });

} else {
    getCfg().then(data => {
        console.log(data);
        handle(data);
    });
}

function getCfg() {
    let type = 0;
    return inquirer.prompt(baseQuestions)
        .then(answers => {
            type = answers.commandType;
            return inquirer.prompt(questions[type]);
        })
        .then(answers => {
            answers.commandType = type;
            return answers;
        });
}

/**
 * 验证和修正所有配置参数
 */
function correctCfg(cfg) {
    if (cfg.commandType === undefined || cfg.commandType === '') {
        console.error('请选择您需要使用的功能！');
        return getCfg();
    }

    console.log(`您已选择[${COMMAD_TEXT[cfg.commandType]}]功能；`);

    let error = validate(cfg.commandType);

    if (error) {
        console.error('参数配置错误，请重新配置：');

        return inquirer.prompt(questions[type]).then(answers => {
            answers.commandType = cfg.commandType;
            return answers;
        });
    }

    return Promise.resolve(cfg);
}

let validate = {
    0: function(cfg) {
        if (validate.folder(cfg.baseReadPath) !== true) {
            return true;
        }

        cfg.baseOutPath = cfg.baseOutPath || getDirname(cfg.baseReadPath);
        if (validate.specialFolder(cfg.baseOutPath) !== true) {
            return true;
        }

        if (validate.specialfile(cfg.hongPath) !== true) {
            return true;
        }
    },
    1: function(cfg) {
        if (validate.folder(cfg.baseTranslatePath) !== true) {
            return true;
        }

        cfg.baseTransOutPath = cfg.baseTransOutPath || getDirname(cfg.baseTranslatePath);
        if (validate.specialFolder(cfg.baseTransOutPath) !== true) {
            return true;
        }

        if (validate.specialfile(cfg.hongPath) !== true) {
            return true;
        }

        if (validate.filePath(cfg.languagePath) !== true) {
            return true;
        }
    },
    2: function(cfg) {
        if (validate.folder(cfg.baseCheckPath) !== true) {
            return true;
        }

        cfg.logPath = cfg.logPath || getDirname(cfg.baseCheckPath);
        if (validate.specialFolder(cfg.logPath) !== true) {
            return true;
        }

        if (validate.specialfile(cfg.hongPath) !== true) {
            return true;
        }

        if (validate.filePath(cfg.langJsonPath) !== true) {
            return true;
        }
    },
    3: function(cfg) {
        if (validate.required(cfg.keyName) !== true) {
            return true;
        }
        if (validate.filePath(cfg.excelPath) !== true) {
            return true;
        }
        cfg.outJsonPath = cfg.outJsonPath || getDirname(cfg.excelPath);
        if (validate.specialFolder(cfg.outJsonPath) !== true) {
            return true;
        }
    },
    4: function(cfg) {
        if (validate.filePath(cfg.jsonPath) !== true) {
            return true;
        }
        cfg.outExcelPath = cfg.outExcelPath || getDirname(cfg.jsonPath);
        if (validate.specialFolder(cfg.outExcelPath) !== true) {
            return true;
        }
    },
    5: function(cfg) {
        if (validate.folder(cfg.baseJsonPath) !== true) {
            return true;
        }
        cfg.outMergeJsonPath = cfg.outMergeJsonPath || getDirname(cfg.baseJsonPath);
        if (validate.specialFolder(cfg.outMergeJsonPath) !== true) {
            return true;
        }
    }
}

function handle(cfg) {
    switch (cfg.commandType) {
        case COMMAD.GET_WORDS:
            getWords(cfg);
            break;
        case COMMAD.TRANSLATE:
            translate(cfg);
            break;
        case COMMAD.CHECK_TRANSLATE:
            check(cfg);
            break;
        case COMMAD.EXCEL_TO_JSON:
            excelToJson(cfg);
            break;
        case COMMAD.JSON_TO_EXCEL:
            jsonToExcel(cfg);
            break;
        case COMMAD.MERGE_JSON:
            mergeJson(cfg);
            break;
    }
}

function getWords(cfg) {
    let extract = new ExtractFile({
        baseReadPath: cfg.baseReadPath,
        baseWritePath: cfg.baseOutPath,
        onlyZH: cfg.onlyZH,
        config_hong_path: cfg.hongPath
    });

    extract.scanFile();
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
        // todo by xc 语言翻译，语言包加载
        transWords: cfg.languagePath
    });

    extract.scanFile();
}

function check(cfg) {
    let extract = new ExtractFile({
        baseReadPath: cfg.baseCheckPath,
        baseWritePath: cfg.logPath,
        config_hong_path: cfg.hongPath,
        transWords: cfg.langJsonPath
    });

    extract.scanFile();
}

function excelToJson(cfg) {
    excel2json({
        excelPath: cfg.excelPath,
        outPath: cfg.outJsonPath,
        sheetName: cfg.sheetName,
        key: cfg.keyName,
        value: cfg.valueName
    });
}

function jsonToExcel(cfg) {
    json2excel(cfg.jsonPath, cfg.outExcelPath);
}

function mergeJson(cfg) {
    mergeJson();
}
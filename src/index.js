import handle from './handle';
import { COMMAD, valid, questions, baseQuestions, COMMAD_TEXT, CONFIG_FILE_NAME, IGNORE_REGEXP } from './util/config';
import { getDirname, LOG_TYPE, log, string2Regexp } from './util/index';

import path from 'path';
import fs from 'fs';
import inquirer from 'inquirer';
import handleRequest from './cmd';

let cwd = process.cwd();
let configFilepath = path.join(cwd, CONFIG_FILE_NAME);

// 扩展String
String.prototype.splice = function(start, end, newStr) {
    return this.slice(0, start) + newStr + this.slice(end);
};

//将命令和参数分离

function gerArgs() {
    let args = require('./util/getOption')(process.argv.splice(2)),
        config;

    switch (+args.type) {
        case COMMAD.GET_WORDS:
            config = {
                commandType: 0,
                onlyZH: args.zh,
                baseReadPath: args.from,
                baseOutPath: args.to,
                hongPath: args.hong
            };
            break;
        case COMMAD.TRANSLATE:
            config = {
                commandType: 1,
                baseTranslatePath: args.from,
                baseTransOutPath: args.to,
                languagePath: args.lang,
                hongPath: args.hong,
                keyName: '',
                valueName: '',
                sheetName: ''
            };
            break;
        case COMMAD.CHECK_TRANSLATE:
            config = {
                commandType: 2,
                baseCheckPath: args.from,
                langJsonPath: args.lang,
                hongPath: args.hong,
                logPath: args.to
            };
            break;
        case COMMAD.EXCEL_TO_JSON:
            config = {
                commandType: 3,
                keyName: args.key,
                valueName: args.value,
                sheetName: args.sheet,
                excelPath: args.from,
                outJsonPath: args.to
            };
            break;
        case COMMAD.JSON_TO_EXCEL:
            config = {
                commandType: 4,
                jsonPath: args.from,
                outExcelPath: args.to
            };
            break;
        case COMMAD.MERGE_JSON:
            config = {
                commandType: 5,
                mainJsonPath: args.src1,
                mergeJsonPath: args.src2,
                outMergeJsonPath: args.dest,
                action: args.action || 1
            };
            console.log(config);
            break;
        case COMMAD.ORIGINAL_CODE:
            config = {
                commandType: 6,
                baseProPath: args.from,
                baseProOutPath: args.to,
                ignoreCode: args.code,
                templateExp: args.exp
            };
            console.log(config);
            break;
        case COMMAD.GET_ALLWORDS:
            config = {
                commandType: 7,
                baseReadPath: args.from,
                languagePath: args.lang,
                baseOutPath: args.to,
                hongPath: args.hong
            };
            console.log(config);
            break;
        case COMMAD.CHECK_LANGEXCEL:
            config = {
                commandType: 8,
                outExcel: args.set,
                inExcel: args.get,
                sheetName1: args.sheetName1,
                keyName1: args.keyName1,
                sheetName2: args.sheetName2,
                keyName2: args.keyName2
            };
            console.log(config);
            break;
    }
    return config;
}

function main(config) {
    if (config || fs.existsSync(configFilepath)) {
        log('读取配置···');
        config = config || require(configFilepath);
        return correctCfg(config);
    } else {
        return getCfg();
    }
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
            fullPath(answers);
            return answers;
        });
}

/**
 * 验证和修正所有配置参数
 */
function correctCfg(cfg) {
    if (cfg.commandType === undefined || cfg.commandType === '') {
        log('请选择您需要使用的功能！', LOG_TYPE.WARNING);
        return getCfg();
    }

    log(`您已选择-${COMMAD_TEXT[cfg.commandType]}功能；`);

    fullPath(cfg);

    let error = validate[cfg.commandType](cfg);

    if (error) {
        log('参数配置错误，请重新配置！', LOG_TYPE.WARNING);

        return inquirer.prompt(questions[cfg.commandType]).then(answers => {
            answers.commandType = cfg.commandType;
            fullPath(answers);
            return answers;
        });
    }

    return Promise.resolve(cfg);
}

function fullPath(cfg) {
    let fullField = ['baseReadPath', 'baseOutPath', 'baseTranslatePath', 'baseTransOutPath', 'hongPath', 'languagePath', 'baseCheckPath', 'logPath', 'langJsonPath', 'excelPath', 'outJsonPath', 'jsonPath', 'outExcelPath', 'mainJsonPath', 'mergeJsonPath', 'outMergeJsonPath', 'baseProPath', 'baseProOutPath'];

    // 将相对地址转为绝对地址
    fullField.forEach(field => {
        let val = cfg[field] || '';
        val = val.replace(/(^\s*)|(\s*$)/g, '');
        if (val == '') {
            return true;
        }

        if (!path.isAbsolute(val)) {
            cfg[field] = path.resolve(cwd, val);
        }
    });
}

const ARG_TYPE = {
    FOLDER: 1,
    FILE: 2
};

function errorMess(key, type) {
    if (type === ARG_TYPE.FOLDER) {
        return `配置[${key}]错误，目标地址无效或者不存在`;
    } else if (type === ARG_TYPE.FILE) {
        return `配置[${key}]错误，目标文件不存在`;
    }
    return `配置[${key}]错误，请修正配置`;
}

let validate = {
    0: function(cfg) {
        if (valid.folder(cfg.baseReadPath) !== true) {
            return errorMess('baseReadPath', ARG_TYPE.FOLDER);
        }

        // 为空的处理
        cfg.baseOutPath = cfg.baseOutPath || getDirname(cfg.baseReadPath);
    },
    1: function(cfg) {
        if (valid.folder(cfg.baseTranslatePath) !== true) {
            return errorMess('baseTranslatePath', ARG_TYPE.FOLDER);
        }

        cfg.baseTransOutPath = cfg.baseTransOutPath || getDirname(cfg.baseTranslatePath);

        if (valid.specialfile(cfg.hongPath) !== true) {
            return errorMess('hongPath', ARG_TYPE.FILE);
        }

        if (valid.existFile(cfg.languagePath) !== true) {
            return errorMess('languagePath', ARG_TYPE.FILE);
        }

        if (path.extname(cfg.languagePath) !== '.json') {
            cfg.keyName = cfg.keyName || 'EN';
            cfg.valueName = cfg.valueName || 'CN';
        }
    },
    2: function(cfg) {
        if (valid.folder(cfg.baseCheckPath) !== true) {
            return errorMess('baseCheckPath', ARG_TYPE.FOLDER);
        }

        cfg.logPath = cfg.logPath || getDirname(cfg.baseCheckPath);

        if (valid.specialfile(cfg.hongPath) !== true) {
            return errorMess('hongPath', ARG_TYPE.FILE);
        }

        if (valid.existFile(cfg.langJsonPath) !== true) {
            return errorMess('langJsonPath', ARG_TYPE.FILE);
        }
    },
    3: function(cfg) {
        cfg.keyName = cfg.keyName || 'EN';
        if (valid.existFile(cfg.excelPath) !== true) {
            return errorMess('excelPath', ARG_TYPE.FILE);
        }
        cfg.outJsonPath = cfg.outJsonPath || getDirname(cfg.excelPath);
    },
    4: function(cfg) {
        if (valid.existFile(cfg.jsonPath) !== true) {
            return errorMess('jsonPath', ARG_TYPE.FILE);
        }
        cfg.outExcelPath = cfg.outExcelPath || getDirname(cfg.jsonPath);
    },
    5: function(cfg) {
        if (valid.existFile(cfg.mainJsonPath) !== true) {
            return errorMess('mainJsonPath', ARG_TYPE.FILE);
        }
        if (valid.existFile(cfg.mergeJsonPath) !== true) {
            return errorMess('mergeJsonPath', ARG_TYPE.FILE);
        }
        cfg.outMergeJsonPath = cfg.outMergeJsonPath || getDirname(cfg.mainJsonPath);
    },
    6: function(cfg) {
        if (valid.folder(cfg.baseProPath) !== true) {
            return errorMess('baseProPath', ARG_TYPE.FOLDER);
        }

        // 为空的处理
        cfg.baseProOutPath = cfg.baseProOutPath || getDirname(cfg.baseProPath);
    },
    7: function (cfg) {
        if (valid.folder(cfg.baseReadPath) !== true) {
            return errorMess('baseReadPath', ARG_TYPE.FILE);
        }
        if (valid.folder(cfg.languagePath) !== true) {
            return errorMess('languagePath', ARG_TYPE.FILE);
        }
    },
    8: function(cfg) {
        if (valid.existFile(cfg.outExcel) !== true) {
            return errorMess('outExcel', ARG_TYPE.FILE);
        }
        if (valid.existFile(cfg.inExcel) !== true) {
            return errorMess('inExcel', ARG_TYPE.FILE);
        }
    }
}

function start(config) {
    if (process.argv.length === 3 && !(config && config.debug)) {
        handleRequest(process.argv[2]);
        return;
    }

    config = config || gerArgs();
    return main(config).then(data => {
        return handle(data);
    });
}

export default start;
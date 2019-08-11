// 处理一些简单的命令
/**
 * b28-cli init
 * b28-cli -v/v
 * b28-cli -h/h
 */
const inquirer = require('inquirer');
import cfg from '../package.json';
const figlet = require('figlet');
import { baseQuestions } from './util/config';
import { log } from './util/index';
import path from 'path';
import fs from 'fs';
const comments = {
    'commandType': '操作类型',
    'onlyZH': '只提取中文',
    'baseReadPath': '待提取文件地址',
    'baseOutPath': '提取的Excel文件输出地址',
    'hongPath': '宏文件地址',
    'baseTranslatePath': '待翻译文件根目录',
    'baseTransOutPath': '翻译后文件输出根目录',
    'hongPath': '宏文件地址',
    'languagePath': '语言包文件地址',
    'sheetName': 'Excel中对应的sheet',
    'keyName': 'key对应列',
    'valueName': 'value对应列',
    'baseCheckPath': '待检查文件根目录',
    'langJsonPath': '语言包json文件地址',
    'logPath': '检查信息输出路径',
    'excelPath': 'Excel文件地址',
    'outJsonPath': '输出json文件目录',
    'jsonPath': 'json文件地址',
    'outExcelPath': '输出Excel文件目录',
    'mainJsonPath': '主json文件地址',
    'mergeJsonPath': '次json文件地址',
    'outMergeJsonPath': '合并后输出的地址',
    'baseProPath': '原厂代码地址',
    'baseProOutPath': '添加翻译函数后文件输出地址',
    'ignoreCode': '需要注释的代码正则',
    'templateExp': '后台插入表达式正则'
};
let questions = [
    [{
        type: 'confirm',
        name: 'onlyZH',
        message: '只提取中文？'
    }, {
        type: 'input',
        name: 'baseReadPath',
        message: '待提取文件地址：'
    }, {
        type: 'input',
        name: 'baseOutPath',
        message: '提取的Excel文件输出地址：'
    }, {
        type: 'input',
        name: 'hongPath',
        message: '宏文件地址：'
    }],
    [{
        type: 'input',
        name: 'baseTranslatePath',
        message: '待翻译文件根目录：'
    }, {
        type: 'input',
        name: 'baseTransOutPath',
        message: '翻译后文件输出根目录：'
    }, {
        type: 'input',
        name: 'hongPath',
        message: '宏文件地址：'
    }, {
        type: 'input',
        name: 'languagePath',
        message: '语言包文件地址：'
    }, {
        type: 'input',
        name: 'sheetName',
        message: 'Excel中对应的sheet：'
    }, {
        type: 'input',
        name: 'keyName',
        message: 'key对应列：', //指代代码中的词条需要被那一列的数据替换
        default: 'EN'
    }, {
        type: 'input',
        name: 'valueName',
        message: 'value对应列：', //指代代码中目前需要被替换的语言
        default: 'CN', // ALL代表所有
        default: ''
    }],
    [{
        type: 'input',
        name: 'baseCheckPath',
        message: '待检查文件根目录：'
    }, {
        type: 'input',
        name: 'langJsonPath',
        message: '语言包json文件地址：'
    }, {
        type: 'input',
        name: 'hongPath',
        message: '宏文件地址：'
    }, {
        type: 'input',
        name: 'logPath',
        message: '检查信息输出路径：'
    }],
    [{
        type: 'input',
        name: 'excelPath',
        message: 'Excel文件地址：'
    }, {
        type: 'input',
        name: 'sheetName',
        message: 'Excel中对应的sheet：'
    }, {
        type: 'input',
        name: 'keyName',
        message: 'key对应列：',
        default: 'EN'
    }, {
        type: 'input',
        name: 'valueName',
        message: 'value对应列：' // ALL代表所有
    }, {
        type: 'input',
        name: 'outJsonPath',
        message: '输出json文件目录：'
    }],
    [{
        type: 'input',
        name: 'jsonPath',
        message: 'json文件地址：'
    }, {
        type: 'input',
        name: 'outExcelPath',
        message: '输出Excel文件目录：'
    }],
    [{
        type: 'input',
        name: 'mainJsonPath',
        message: '主json文件地址：'
    }, {
        type: 'input',
        name: 'mergeJsonPath',
        message: '次json文件地址：'
    }, {
        type: 'input',
        name: 'outMergeJsonPath',
        message: '合并后输出的地址：'
    }],
    [{
        type: 'input',
        name: 'baseProPath',
        message: '原厂代码地址：'
    }, {
        type: 'input',
        name: 'baseProOutPath',
        message: '添加翻译函数后文件输出地址：'
    }, {
        type: 'input',
        name: 'ignoreCode',
        message: '需要注释的代码正则：',
        default: '/<!--\s*hide|-->/g'
    }, {
        type: 'input',
        name: 'templateExp',
        message: '后台插入表达式正则：',
        default: '/<%([^\n]*?)%>/g'
    }]
];
/**
 * 初始化b28.config.js文件
 */
function handleInit() {
    let config = {};
    inquirer.prompt(baseQuestions)
        .then(answers => {
            config.commandType = answers.commandType;
            return inquirer.prompt(questions[answers.commandType]);
        })
        .then(answers => {
            answers = Object.assign({}, config, answers);
            return answers;
        }).then(data => {
            let str = `module.exports = {\r\n\t`,
                notString = ['onlyZH', 'commandType'];

            for (let key in data) {
                str += '/**\r\n\t';
                str += ` * ${comments[key]}\r\n\t`;
                str += ' */\r\n\t';
                let text = notString.includes(key) ? data[key] : `"${(data[key] || '').replace(/"/g, '\\"')}"`;
                str += `${key}: ${text},\r\n\t`;
            }
            str = str.replace(/,\r\n\t$/g, '\r\n');
            str += '}';

            let outPath = path.join(process.cwd(), 'b28.config.js');
            fs.writeFile(outPath, str, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                log(`生成配置文件：[${outPath}]`);
            });
        });
}

function handleVersion() {
    console.log('v' + cfg.version);

    figlet('B28-CLI', function(err, data) {
        if (err) {
            return;
        }
        console.log(data)
    });
}

function handleHelp() {
    console.log('help:\r\n\tinit\t初始化配置文件b28.config.js\r\n\t -v\t获取版本号\r\n\t -h\t获取帮助信息');
}

function handle(arg) {
    if (!arg) {
        return;
    }

    arg = arg.replace(/^-/, '').toLowerCase();
    switch (arg) {
        case 'init':
            handleInit();
            break;
        case 'v':
            handleVersion();
            break;
        case 'h':
            handleHelp();
            break;
    }
}

export default handle;
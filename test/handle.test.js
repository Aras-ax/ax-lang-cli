const fs = require('fs');
const start = require('../src/index');
const { COMMAD } = require('../src/util/config');

let words = ['EN',
    "D:/Git/translate/test/TestFile/test/allTest/html/hello.html",
    "Hello Title",
    "Note: <b id=\"doReboot\">reset</b> to de ok.",
    "Note: from <b id=\"doRebootKiKi\">not the same</b> no one.",
    "this is data-title",
    "data lang world",
    "random code:",
    "copy",
    "data lang reBorn",
    "重生",
    "idone know \\n about this",
    "generWay",
    "random type `` ` code:",
    "一键登录",
    "免认证",
    "idCard",
    "phoneNum",
    "save",
    "save1",
    'D:/Git/translate/test/TestFile/test/allTest/js/hello.js',
    '我们不\"一样',
    '宏控制词条',
    '宏不一样所以肯定被提取',
    '没有对应的结束宏，可以被提取',
    '符号提(\')取验(")证项',
    '换行和tab验证：',
    '时间组一：',
    '类型：',
    '系统日志',
    'Attack \'Log"',
    '错误日志',
    'Log \n Content'
];

let hongPath = 'D:/Git/translate/test/TestFile/config/index.js';

describe('全功能，统一入口，功能正确性验证', () => {
    it('验证语言提取完整参数', () => {
        expect.assertions(1);
        return start({
            commandType: COMMAD.GET_WORDS,
            baseReadPath: 'D:/Git/translate/test/TestFile/test/allTest',
            baseOutPath: 'D:/Git/translate/test/TestFile/output/allTest',
            onlyZH: false,
            hongPath
        }).then(data => {
            return expect(data.sort()).toEqual(words.sort());
        });
    });

    it('验证语言提取缺省参数', () => {
        expect.assertions(1);
        return start({
            commandType: COMMAD.GET_WORDS,
            baseReadPath: 'D:/Git/translate/test/TestFile/test/allTest',
            baseOutPath: '',
            onlyZH: false,
            hongPath
        }).then(data => {
            return expect(data.sort()).toEqual(words.sort());
        });
    });

    it('验证翻译的正确性', () => {
        expect.assertions(1);
        return start({
            commandType: COMMAD.TRANSLATE,
            baseTranslatePath: 'D:/Git/translate/test/TestFile/test/allTest',
            baseTransOutPath: 'D:/Git/translate/test/TestFile/output/allTest',
            languagePath: 'D:/Git/translate/test/TestFile/testData/allTest/translate.xlsx',
            hongPath,
            sheetName: '',
            keyName: 'EN',
            valueName: 'CN'
        }).then(data => {
            return expect(data).toEqual([]);
        });
    });

    it('验证翻译检查的正确性', () => {
        expect.assertions(1);
        return start({
            commandType: COMMAD.CHECK_TRANSLATE,
            baseCheckPath: 'D:/Git/translate/test/TestFile/testData/allTest/translate',
            langJsonPath: 'D:/Git/translate/test/TestFile/testData/allTest/translate/lang.json',
            hongPath,
            logPath: 'D:/Git/translate/test/TestFile/output/allTest/test'
        }).then(data => {
            return expect(data).toEqual([]);
        });
    });

    it('验证Excel转Json数组的正确性', () => {
        expect.assertions(1);
        return start({
            commandType: COMMAD.EXCEL_TO_JSON,
            keyName: 'EN',
            valueName: '',
            sheetName: '',
            excelPath: 'D:/Git/translate/test/TestFile/testData/excel2json.xlsx',
            outJsonPath: 'D:/Git/translate/test/TestFile/output'
        }).then(data => {
            return expect(data).toEqual([
                '我们不"一样',
                '这条肯定不能被提取',
                '宏控制词条',
                '宏不一样所以肯定被提取',
                '没有对应的结束宏，可以被提取',
                '符号提(\')取验(")证项',
                'change line and tabs',
                '时间组一：',
                '类型：',
                '系统日志',
                'Attack\n Log',
                '错误日志',
                'Log Content'
            ]);
        });
    });

    it('验证Excel转Json对象的正确性', () => {
        expect.assertions(1);
        return start({
            commandType: COMMAD.EXCEL_TO_JSON,
            keyName: 'CN',
            valueName: 'EN',
            sheetName: '',
            excelPath: 'D:/Git/translate/test/TestFile/testData/excel2json.xlsx',
            outJsonPath: 'D:/Git/translate/test/TestFile/output'
        }).then(data => {
            return expect(data.EN).toEqual({
                'We are not \' the " same': '我们不"一样',
                'This Word can not be selected.': '这条肯定不能被提取',
                '宏控制词条': '宏控制词条',
                'CONFIG is Diff, so it can be selected.': '宏不一样所以肯定被提取',
                'single Config has no use': '没有对应的结束宏，可以被提取',
                '符号提(\')取验(")证项': '符号提(\')取验(")证项',
                'change line and tabs': 'change line and tabs',
                'time group:': '时间组一：',
                'type:': '类型：',
                'system log': '系统日志',
                '攻击\n日志': 'Attack\n Log',
                'error log': '错误日志',
                '日志内容': 'Log Content'
            });
        });
    });

    it('验证Json转Excel的正确性', () => {
        expect.assertions(1);
        return start({
            commandType: COMMAD.JSON_TO_EXCEL,
            jsonPath: 'D:/Git/translate/test/TestFile/testData/onlyZH.json',
            outExcelPath: 'D:/Git/translate/test/TestFile/output/test1.xlsx'
        }).then(data => {
            return fs.readFile('D:/Git/translate/test/TestFile/output/test1.xlsx');
        }).then(data => {
            return expect(true).toBeTruthy();
        }).catch(data => {
            return expect(false).toBeTruthy();
        });
    });

    // it('验证Json合并的正确性', () => {
    //     expect.assertions(1);
    //     return start({
    //         commandType: COMMAD.MERGE_JSON,
    //         mainJsonPath: '',
    //         mergeJsonPath: '',
    //         outMergeJsonPath: ''
    //     }).then(data => {
    //         return expect(data).toEqual(words);
    //     });
    // });
});
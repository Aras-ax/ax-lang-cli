const ExtractFile = require('./ExtractFile.js');
const excel2json = require('./excel2json');
const json2excel = require('./json2excel');
const mergeJson = require('./mergeObject');

// let extract = new ExtractFile({
//     baseReadPath: 'D:\\Git\\translate\\test\\TestFile\\getLanSimple',
//     baseWritePath: 'D:\\Git\\translate\\test\\TestFile\\output',
//     onlyZH: true,
//     isTranslate: false,
//     config_hong_path: {},
//     transWords: data
// });

// extract.scanFile();
// return;

// excel2json({
//     excelPath: 'D:\\Git\\translate\\test\\TestFile\\output\\词条EN.xlsx',
//     sheetName: '',
//     outPath: 'D:\\Git\\translate\\test\\TestFile\\getLanSimpleData',
//     fileName: 'en.json',
//     key: 'CN'
// });

// let extract = new ExtractFile({
//     baseReadPath: 'D:\\Git\\translate\\test\\TestFile\\simpleTest\\html',
//     baseWritePath: 'D:\\Git\\translate\\test\\TestFile\\output',
//     onlyZH: false,
//     isTranslate: false,
//     config_hong_path: 'D:\\Git\\translate\\test\\TestFile\\config\\macro_config.js',
//     transWords: {}
// });

// extract.scanFile().then(data => {
//     let t = 1;
// });

// excel2json({
//     excelPath: 'D:\\Git\\translate\\test\\TestFile\\simpleTestData\\js\\translate.xlsx',
//     sheetName: '',
//     key: 'EN',
//     value: 'CN'
// }).then(data => {
new ExtractFile({
    baseReadPath: 'D:\\Git\\translate\\test\\TestFile\\simpleTest\\js',
    baseWritePath: 'D:\\Git\\translate\\test\\TestFile\\output',
    onlyZH: false,
    isTranslate: true,
    config_hong_path: 'D:\\Git\\translate\\test\\TestFile\\config\\macro_config.js',
    transWords: {
        "D:/Git/translate/test/TestFile/simpleTest/js/hello.js": "D:/Git/translate/test/TestFile/simpleTest/js/hello.js",
        "我们不\"一样": "We are not ' the \" same",
        "这条肯定不能被提取": "This Word can not be selected.",
        "宏控制词条": "CONFGI Word",
        "宏不一样所以肯定被提取": "CONFIG is Diff, so it can be selected.",
        "没有对应的结束宏，可以被提取": "single Config has no use",
        "符号提(')取验(\")证项": "I don’t know how (') to (\") translate.",
        "换行和tab验证：": "change line and tabs",
        "时间组一：": "time group:",
        "类型：": "type:",
        "系统日志": "system log",
        "Attack 'Log\"": "攻击日志",
        "错误日志": "error log",
        "Log \n Content": "日志内容"
    }
}).scanFile();
// })
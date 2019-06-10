import excel2json from '../src/excel2json';
let data1 = [
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
    ],
    data2 = ['We are not \' the " same',
        'This Word can not be selected.',
        '宏控制词条',
        'CONFIG is Diff, so it can be selected.',
        'single Config has no use',
        '符号提(\')取验(")证项',
        'change line and tabs',
        'time group:',
        'type:',
        'system log',
        '攻击\n日志',
        'error log',
        '日志内容'
    ];

// excel2json({
//     excelPath: './TestFile/testData/excel2json.xlsx',
//     outPath: './TestFile/output',
//     sheetName: '',
//     key: 'EN',
//     value: ''
// });

describe('excel2json正确性验证', () => {
    it('第一列缺少验证', () => {
        expect.assertions(1);
        return excel2json({
            excelPath: './TestFile/testData/excel2json.xlsx',
            outPath: './TestFile/output',
            sheetName: '',
            key: 'EN',
            value: ''
        }).then(data => expect(data).toEqual(data1));
    });

    it('第二列缺少验证', () => {
        expect.assertions(1);
        return excel2json({
            excelPath: './TestFile/testData/excel2json.xlsx',
            outPath: '',
            sheetName: 'EN',
            key: 'CN',
            value: ''
        }).then(data => expect(data).toEqual(data2));
    });

    it('sheetname不存在，返回空', () => {
        expect.assertions(1);
        return excel2json({
            excelPath: './TestFile/testData/excel2json.xlsx',
            sheetName: 'ttN',
            key: 'CN',
            value: ''
        }).then(data => expect(data).toEqual([]));
    });

    it('同时转换多个对象', () => {
        expect.assertions(1);
        return excel2json({
            excelPath: './TestFile/testData/repeat.xlsx',
            outPath: './TestFile/output',
            sheetName: '',
            key: 'EN',
            value: 'ALL'
        }).then(data => {
            return expect(Object.keys(data.CN).sort()).toEqual(Object.keys(data.ZH).sort())
        });
    });
});
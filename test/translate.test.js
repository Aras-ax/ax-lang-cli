const excel2json = require('../src/excel2json');
const ExtractFile = require('../src/ExtractFile');

let extract = new ExtractFile({
    baseReadPath: 'D:\\Git\\translate\\test\\TestFile\\simpleTest\\js',
    baseWritePath: 'D:\\Git\\translate\\test\\TestFile\\output',
    onlyZH: false,
    isTranslate: true,
    config_hong_path: 'D:\\Git\\translate\\test\\TestFile\\config\\macro_config.js',
    transWords: {}
});

it('验证翻译JS的正确性', () => {
    expect.assertions(1);
    return excel2json({
        excelPath: 'D:\\Git\\translate\\test\\TestFile\\simpleTestData\\js\\translate.xlsx',
        outPath: 'D:\\Git\\translate\\test\\TestFile\\output',
        sheetName: '',
        key: 'CN',
        value: 'EN'
    }).then(data => {
        extract.setAttr('transWords', data);
        return extract.scanFile();
    }).then(data => {
        return expect(data).toEqual([]);
    });
});

it('验证翻译HTML的正确性', () => {
    expect.assertions(1);
    return excel2json({
        excelPath: 'D:\\Git\\translate\\test\\TestFile\\simpleTestData\\html\\translate.xlsx',
        outPath: '',
        sheetName: '',
        key: 'EN',
        value: 'CN'
    }).then(data => {
        extract.setAttr({
            transWords: data,
            baseReadPath: 'D:\\Git\\translate\\test\\TestFile\\simpleTest\\html'
        });
        return extract.scanFile();
    }).then(data => {
        return expect(data).toEqual([]);
    });
});

it('验证Excel翻译的正确性', () => {
    expect.assertions(1);
    return excel2json({
        excelPath: 'D:\\Git\\translate\\test\\TestFile\\simpleTestData\\js\\translate.xlsx',
        outPath: 'D:\\Git\\translate\\test\\TestFile\\output',
        sheetName: '',
        key: 'CN',
        value: ''
    }).then(data => {
        let langData = {};
        data = data['CN'];
        for (let key in data) {
            langData[data[key]] = key;
        }

        extract.setAttr('transWords', langData);
        extract.scanFile();
    }).then(data => {
        return expect(data).toEqual([]);
    });
});
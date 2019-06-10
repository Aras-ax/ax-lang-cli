import excel2json from '../src/excel2json';
import ExtractFile from '../src/ExtractFile';

let extract = new ExtractFile({
    baseReadPath: './TestFile/test/js',
    baseWritePath: './TestFile/output',
    onlyZH: false,
    isTranslate: true,
    hongPath: './TestFile/config/index.js',
    transWords: {}
});

it('验证翻译JS的正确性', () => {
    expect.assertions(1);
    return excel2json({
        excelPath: './TestFile/testData/js/translate.xlsx',
        outPath: './TestFile/output',
        sheetName: '',
        key: 'CN',
        value: 'EN'
    }).then(data => {
        extract.setAttr('transWords', data.EN);
        return extract.scanFile();
    }).then(data => {
        return expect(data).toEqual([]);
    });
});

it('验证翻译HTML的正确性', () => {
    expect.assertions(1);
    return excel2json({
        excelPath: './TestFile/testData/html/translate.xlsx',
        outPath: '',
        sheetName: '',
        key: 'EN',
        value: 'CN'
    }).then(data => {
        extract.setAttr({
            transWords: data.CN,
            baseReadPath: './TestFile/test/html'
        });
        return extract.scanFile();
    }).then(data => {
        return expect(data).toEqual([]);
    });
});
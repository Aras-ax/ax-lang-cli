import ExtractFile from '../src/ExtractFile';
const htmlData = require('./TestFile/testData/html/index');
const jsData = require('./TestFile/testData/js/index');

let extract = new ExtractFile({
    baseReadPath: './TestFile/test/js',
    baseWritePath: './TestFile/output',
    onlyZH: false,
    isTranslate: false,
    hongPath: './TestFile/config/index.js',
    transWords: {}
});
// extract.scanFile();

describe('验证js文件语言提取的正确性', () => {
    it('根据宏提取词条', () => {
        expect.assertions(1);
        return extract.scanFile().then(data => expect(data).toEqual(jsData.data));
    });

    it('仅仅中文提取', () => {
        expect.assertions(1);
        extract.setAttr('onlyZH', true);
        return extract.scanFile().then(data => expect(data).toEqual(jsData.data_cn));
    });

    it('宏为空，提取全部词条', () => {
        expect.assertions(1);
        extract.setAttr({
            onlyZH: false,
            CONFIG_HONG: {}
        });
        return extract.scanFile().then(data => expect(data).toEqual(jsData.data_all));
    });
});

describe('验证HTML文件语言提取的正确性', () => {
    it('根据宏提取词条', () => {
        expect.assertions(1);
        extract.setAttr({
            'baseReadPath': './TestFile/test/html',
            CONFIG_HONG: {
                CONFIG_ADVANCE_FALSE: false,
                CONFIG_ADVANCE_DDNS: true
            }
        });
        return extract.scanFile().then(data => expect(data).toEqual(htmlData.data));
    });

    it('仅仅中文提取', () => {
        expect.assertions(1);
        extract.setAttr({
            'onlyZH': true,
            CONFIG_HONG: {
                CONFIG_ADVANCE_FALSE: true,
                CONFIG_ADVANCE_DDNS: true
            }
        });
        return extract.scanFile().then(data => expect(data).toEqual(htmlData.data_cn));
    });

    it('宏为空，提取全部词条', () => {
        expect.assertions(1);
        extract.setAttr({
            onlyZH: false,
            CONFIG_HONG: {}
        });
        return extract.scanFile().then(data => expect(data).toEqual(htmlData.data_all));
    });
});
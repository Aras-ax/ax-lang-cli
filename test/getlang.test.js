const ExtractFile = require('../src/ExtractFile');

let extract = new ExtractFile({
    baseReadPath: 'D:\\Git\\translate\\test\\TestFile\\simpleTest\\js',
    baseWritePath: 'D:\\Git\\translate\\test\\TestFile\\output',
    onlyZH: false,
    isTranslate: false,
    config_hong_path: 'D:\\Git\\translate\\test\\TestFile\\config\\macro_config.js',
    transWords: {}
});

let jsData = ['EN',
        ['D:/Git/translate/test/TestFile/simpleTest/js/hello.js'],
        'we are not " the same',
        '宏控制词条',
        '宏不一样所以肯定被提取',
        '没有对应的结束宏，可以被提取',
        '符号提(\')取验(")证项',
        '换行和tab验证：',
        'Time1',
        'Type',
        'System Log1',
        'Attack Log',
        'Error Log',
        'Log Content'
    ],
    htmlData = [];
describe('验证语言提取的正确性', () => {
    it('js文件语言包提取正确性', () => {
        expect.assertions(1);
        return extract.scanFile().then(data => expect(data).toEqual(jsData));
    });
});
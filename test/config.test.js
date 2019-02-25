const minimatch = require("minimatch");
const { EXCLUDE_FILE, EXCLUDE_FILE_END } = require('../src/util/config');

describe('测试排除文件夹正则正确性', () => {
    test('用例：a/lang', () => {
        expect(minimatch('a/lang', EXCLUDE_FILE_END)).toBeTruthy();
    });

    test('用例：common/img', () => {
        expect(minimatch('common/img', EXCLUDE_FILE_END)).toBeTruthy();
    });

    test('用例：common/img/a.png', () => {
        expect(minimatch('common/img/a.png', EXCLUDE_FILE)).toBeTruthy();
    });

    test('用例：common/img/book', () => {
        expect(minimatch('common/img/book', EXCLUDE_FILE)).toBeTruthy();
    });

    test('用例：img', () => {
        expect(minimatch('img', EXCLUDE_FILE_END)).toBeTruthy();
    });

    test('用例：common/b28', () => {
        expect(minimatch('common/b28', EXCLUDE_FILE_END)).toBeTruthy();
    });

    test('用例：dist/goform', () => {
        expect(minimatch('dist/goform', EXCLUDE_FILE_END)).toBeTruthy();
    });

    test('用例：dist/goform/', () => {
        expect(minimatch('dist/goform/', EXCLUDE_FILE_END)).toBeTruthy();
    });

    test('用例：git/cgi-bin', () => {
        expect(minimatch('git/cgi-bin', EXCLUDE_FILE_END)).toBeTruthy();
    });

    test('用例：common/t.min.js', () => {
        expect(minimatch('common/t.min.js', EXCLUDE_FILE_END)).toBeTruthy();
    });

    test('用例：common/shiv.js', () => {
        expect(minimatch('common/shiv.js', EXCLUDE_FILE_END)).toBeTruthy();
    });

    test('用例：common/tttshiv.js', () => {
        expect(minimatch('common/tttshiv.js', EXCLUDE_FILE_END)).toBeTruthy();
    });

    test('用例：common/t.respond.js', () => {
        expect(minimatch('common/t.respond.js', EXCLUDE_FILE_END)).toBeTruthy();
    });

    test('用例：common/trespond.js', () => {
        expect(minimatch('common/trespond.js', EXCLUDE_FILE_END)).toBeTruthy();
    });

    test('用例：common/t.shim.js', () => {
        expect(minimatch('common/t.shim.js', EXCLUDE_FILE_END)).toBeTruthy();
    });

    test('用例：tshim.js', () => {
        expect(minimatch('tshim.js', EXCLUDE_FILE_END)).toBeTruthy();
    });
});
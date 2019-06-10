import { mergeObject, partMerge } from '../src/util/index';

let obj = {
        a: 1,
        b: 2
    },
    obj1 = {
        b: 3,
        c: 4
    },
    objobj1 = {
        a: 1,
        b: 3,
        c: 4
    },
    obj2 = {
        a: 1,
        b: {
            a: 2,
            c: 3,
            d: {
                a: 1,
                b: 2
            }
        },
        c: [1, 2, 3]
    },
    obj3 = {
        a: 3,
        b: {
            c: 4,
            d: {
                f: 3
            },
            f: [1, 2, 3]
        },
        c: [4, 3, 2, 11],
        d: {
            d: 1
        }
    },
    obj4 = {
        a: 3,
        b: {
            a: 2,
            c: 4,
            d: {
                a: 1,
                b: 2,
                f: 3
            },
            f: [1, 2, 3]
        },
        c: [1, 2, 3, 4, 11],
        d: {
            d: 1
        }
    };
let arr = [1, 2, 3, 4],
    arr1 = [3, 4, 6, 8],
    arrarr1 = [1, 2, 3, 4, 6, 8];

describe('验证[mergeObject]的正确性', () => {
    test('对象合并', () => {
        expect(mergeObject(obj, obj1)).toEqual(objobj1);
    });
    test('数组合并', () => {
        expect(mergeObject(arr, arr1)).toEqual(arrarr1);
    });
    test('对象深度合并', () => {
        expect(mergeObject(obj2, obj3)).toEqual(obj4);
    });
    test('部分合并', () => {
        expect(partMerge({ a: 1, b: 2 }, { b: 3, c: 4 })).toEqual({
            b: 2,
            c: 4
        });
    });
});
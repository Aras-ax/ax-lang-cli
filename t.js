var multiply = function(num1, num2) {
    if (num1.length < num2.length) {
        return multiply(num2, num1);
    }

    let res_list = [],
        num1_len = num1.length - 1,
        num2_len = num2.length - 1;

    for (let i = num2_len; i >= 0; i--) {
        let num = +num2[i],
            res = '',
            zero_count = num2_len - i,
            left = 0;

        // 0补位
        while (zero_count > 0) {
            res += '0';
            zero_count--;
        }

        for (let j = num1_len; j >= 0; j--) {
            let sum = num * (+num1[j]) + left;
            left = Math.floor(sum / 10);
            res = sum % 10 + res;
        }
        // 保留进位数
        if (left !== 0) {
            res = left + res;
        }
        res_list.push(res);
    }
    return res_list.reduce((str1, str2) => add(str1, str2));
};

// 字符串相加
function add(str1, str2) {
    if (str1.length < str2.length) {
        return add(str2, str1);
    }

    let str = '',
        left = 0;
    for (let i = str1.length - 1, j = str2.length - 1; i >= 0; i--, j--) {
        let num1 = +str1[i],
            num2 = j >= 0 ? +str2[j] : 0,
            sum = num1 + num2 + left;

        left = Math.floor(sum / 10);
        str = sum % 10 + str;
    }

    // 保留进位数
    if (left !== 0) {
        str = left + str;
    }
    return str;
}


// console.log(quickSort([1, 2, 3, 4, 5, 6, 4, 4, 3, 3, 6, 0]));
var permute = function(nums) {
    if (nums.length < 1) {
        return [];
    }

    let outData = [
            [nums[0]]
        ],
        temp = [];

    for (let i = 1; i < nums.length; i++) {
        temp = [];
        let cur = nums[i];
        outData.forEach((arr) => {
            arr.forEach((item, index) => {
                temp.push([...arr.slice(0, index + 1), cur, ...arr.slice(index + 1)]);
            });
            temp.push([cur, ...arr]);
        });
        outData = temp;
    }

    return outData;
};

console.log(permute([1, 2, 3]));
var fourSum = function(nums, target) {
    nums = nums.sort((a, b) => a - b);
    let res = [],
        hash = {};
    for (let i = 0, l = nums.length; i < l - 3; i++) {
        let r = threeSum(nums, i + 1, l, target, hash);
        res.push(...r);
    }

    return res;
};

function threeSum(nums, i, l, target, hash) {
    let res = [],
        cur = nums[i - 1];

    target = target - cur;

    for (; i < l - 2; i++) {
        if (target >= 0 && nums[i] > target) {
            return res;
        }
        let left = i + 1,
            right = l - 1;

        while (left < right) {
            let sum = nums[i] + nums[left] + nums[right];
            if (sum > target) {
                while (nums[right] === nums[right - 1]) {
                    right--;
                }
                right--;
            } else if (sum < target) {
                while (nums[left] === nums[left + 1]) {
                    left++;
                }
                left++;
            } else {
                let key = '' + cur + nums[i] + nums[left] + nums[right];
                if (!hash[key]) {
                    hash[key] = true;
                    res.push([cur, nums[i], nums[left], nums[right]]);
                }
                while (nums[right] === nums[right - 1]) {
                    right--;
                }
                while (nums[left] === nums[left + 1]) {
                    left++;
                }
                left++;
                right--;
            }
        }
    }
    return res;
}

console.log(fourSum([0, 1, 3, -5, 3, 0],
    1));
function merge(obj, ...others) {
    let outData = Object.assign(Object.prototype.toString.call(obj) === '[object Object]' ? {} : [], obj);
    if (others) {
        others.forEach(itemObj => {
            outData = mergeObject(outData, itemObj);
        });
    }
    return outData;
}

function mergeObject(main, other) {
    if (Object.prototype.toString.call(main) === '[object Array]') {
        return [...new Set(main.concat(other))];
    }

    for (let key in other) {
        let data = other[key];
        if (main[key] !== undefined && typeof main[key] === 'object' && typeof data === 'object') {
            main[key] = mergeObject(main[key], data);
        } else {
            main[key] = data;
        }
    }

    return main;
}

module.exports = merge;
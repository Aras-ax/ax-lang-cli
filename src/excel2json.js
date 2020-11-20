import {
  loadExcel,
  writeJson,
  formatKey,
  decodeKey,
  writeExcel,
  log,
  LOG_TYPE
} from "./util/index";

import path from "path";

/**
 * excelPath, outPath, sheetName, key, value
 */
function excel2json(option) {
  option.saveData = option.saveData === false ? false : true;
  let data = loadExcel(option.excelPath, option.sheetName);

  if (option.key) {
    option.key = option.key.toUpperCase();
  }
  if (option.value) {
    option.value = option.value.toUpperCase();
  }
  if (data.length === 0) {
    log(`数据为空，可能是sheetname不存在导致的`, LOG_TYPE.WARNING);
    return Promise.resolve([]);
  }
  data = transferData(data, option);

  if (data === -1) {
    return Promise.resolve({});
  }

  if (option.outPath) {
    if (Array.isArray(data)) {
      let outPath = path.join(option.outPath, option.fileName || "lang.json");

      return writeJson(data, outPath)
        .then((data) => {
          log(`Excel to Json文件已写入地址-${outPath}`);
          return data;
        })
        .catch((error) => {
          log(`Excel to Json失败，${error}`, LOG_TYPE.ERROR);
          return {};
        });
    } else {
      let promiseList = [];
      option.outPath = path.join(option.outPath, "lang");
      for (let key in data) {
        let outPath = path.join(option.outPath, `${key}.json`);

        promiseList.push(writeJson(data[key], outPath));
      }
      return Promise.all(promiseList)
        .then((data1) => {
          log(`Excel to Json文件已写入文件夹-${option.outPath}下`);
          return data;
        })
        .catch((error) => {
          log(`Excel to Json失败，${error}`, LOG_TYPE.ERROR);
          return {};
        });
    }
  } else {
    log(`Excel to Json成功，无需保存到本地`);
    return Promise.resolve(data);
  }
}

/**
 * 提供value输出对象json, 不提供输出数组json
 * value为值对应的语言列，多个语言列用逗号隔开
 */
function transferData(data, option) {
  let keyValueRow = data.shift(),
    key = option.key,
    value = option.value || "",
    outData = value === "" ? [] : {};

  keyValueRow = keyValueRow.join(",").toUpperCase().split(",");

  let keyIndex = keyValueRow.indexOf(key);

  if (keyIndex === -1) {
    log(`Excel中不存在keyName列`, LOG_TYPE.ERROR);
    return -1;
  }

  if (data.length === 0) {
    return outData;
  }

  if (value === "") {
    data.forEach((item) => {
      let value = trim(item[keyIndex]),
        i = 0;
      while (!value && i < item.length) {
        value = trim(item[i++]);
      }
      outData.push(value);
    });
    return outData;
  }

  // 多列解析，同时对重复的词条进行重新编码
  value = value.toUpperCase().split(",");

  if (value.length === 1 && value[0] === "ALL") {
    value = keyValueRow.filter(
      (item) => !!item.replace(/\s/g, "") && item !== key
    );
  }

  let valueIndex = {};
  // 获取每个值字段对应的excel的列索引
  value.forEach((item) => {
    valueIndex[item] = keyValueRow.indexOf(item);
  });

  value.forEach((valItem) => {
    let valIndex = valueIndex[valItem],
      decodeKeys = {},
      transData = {};
    if (valIndex === -1) {
      log(`Excel中不存在${valItem}列`, LOG_TYPE.ERROR);
    } else {
      data.forEach((dataItem) => {
        let keyWorld = trim(dataItem[keyIndex]),
          valueWorld = trim(dataItem[valIndex]),
          repeatKey = "";

        if (!keyWorld) {
          keyWorld = valueWorld;
          dataItem[keyIndex] = valueWorld;
        }

        if (!valueWorld) {
          valueWorld = decodeKey(keyWorld);
          dataItem[valIndex] = decodeKey(keyWorld);
        }

        // 重复判断
        if (transData[keyWorld] && transData[keyWorld] !== valueWorld) {
          let repeatKeys = decodeKeys[keyWorld] || [],
            oldKey = keyWorld;

          repeatKeys.some((key) => {
            if (transData[key] === valueWorld) {
              repeatKey = key;
              // 更新原数，以便下次直接用新的key值进行转换
              dataItem[keyIndex] = key;
              return true;
            }
          });

          if (repeatKey) {
            return true;
          }

          keyWorld = formatKey(keyWorld);

          // 对重复的key进行重新编码
          while (outData[keyWorld]) {
            keyWorld = formatKey(keyWorld);
          }
          repeatKeys.push(keyWorld);
          // 更新原数，以便下次直接用新的key值进行转换
          dataItem[keyIndex] = keyWorld;
          // 记录当前重新编码的词条
          decodeKeys[oldKey] = repeatKeys;
          // 同步修改已经转换好的语言
          syncKey(outData, oldKey, keyWorld);
        }

        transData[keyWorld] = valueWorld;
      });
    }
    outData[valItem] = transData;
  });

  // 因为会重新编码key字段，故还需要对excel文件进行回写操作，以保证其他地方使用excel文件时词条的正确性
  data.unshift(keyValueRow);
  let extName = path.extname(option.excelPath),
    reg = new RegExp(extName + "$");

  writeExcel(
    data,
    option.excelPath.replace(reg, "_copy") + extName,
    option.sheetName || "lang"
  );

  return outData;
}

function syncKey(obj, key, newKey) {
  for (let t in obj) {
    if (obj[t]) {
      obj[t][newKey] = obj[t][key];
    }
  }
}

function trim(str) {
  if (!str) {
    return str;
  }
  return str
    .replace(/^(\s+)|(\s+)$/, "")
    .replace(/ +/g, " ")
    .replace(/\r\n/g, "\n");
}

export default excel2json;

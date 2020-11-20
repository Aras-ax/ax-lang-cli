import path from "path";

import {
  scanFolder,
  correctPath,
  loadJson,
  writeExcel,
  log,
  LOG_TYPE,
  getNowFormatDate
} from "./util/index";

let langArr = {
  en: "英语",
  cn: "简体中文",
  zh: "繁體中文",
  de: "德语", //德语
  en: "英语", //英语
  es: "西班牙", //西班牙
  fr: "法国", //法国
  hu: "匈牙利", //匈牙利
  it: "意大利", //意大利
  pl: "波兰", //波兰
  ro: "罗马尼亚", //罗马尼亚
  sa: "阿拉伯", //阿拉伯
  tr: "土耳其", //土耳其
  ru: "俄语", //Russian	俄语
  pt: "葡萄牙语", //Portugal 葡萄牙语
  uk: "乌克兰", //乌克兰
  br: "巴西葡语", //巴西葡语
  nl: "荷兰语", //荷兰语
  cs: "捷克语", //捷克语
  mx: "拉美西语", //拉美西语
  kk: "哈萨克语", //哈萨克语
  ko: "韩语", //韩语，sublime默认字体显示乱码
  bg: "保加利亚语", //保加利亚语
  laes: "美西", //美西
  brpt: "巴葡" // 巴葡
};
/**
 *
 * @param {Array} words
 * @param {string} jsonPath
 * @param {string} outPath
 */
async function ExtractLangExcel(words, jsonPath, outPath) {
  let outData = [],
    jsonFolders = [],
    filePath = "",
    dataIndex = 1,
    curLang = "en";
  jsonPath = correctPath(jsonPath);
  jsonFolders = scanFolder(jsonPath).items;
  outPath = path.join(
    correctPath(outPath),
    "lang" + +getNowFormatDate() + ".xlsx"
  );

  // 每一行的数据存在一个数组中，二维数组outData是完整的数据，用来最终生成excel文件
  words.forEach(function (item, index) {
    outData[index] = [];
    outData[index].push(item);
  });

  for (let jsonKey of jsonFolders) {
    curLang = langArr[jsonKey] || "en";
    outData[0].push(curLang);
    filePath = path.normalize(`${jsonPath}/${jsonKey}/translate.json`);
    await getExcelData(words, outData, filePath, dataIndex);
    dataIndex++;
  }

  try {
    outData = Array.from([...new Set(outData)][0]);
    writeExcel(outData, outPath, "lang");
    log(`代码中所有词条的翻译已提取完成，保存在${outPath}中`, LOG_TYPE.DONE);
  } catch (e) {
    log(`写入excel失败，${e}`, LOG_TYPE.ERROR);
    return {};
  }
}

function getExcelData(words, outData, filePath, dataIndex) {
  return loadJson(filePath).then(function (data) {
    data = trimJson(data);
    // data是json文件的值，json对象
    words.forEach(function (item, wordIndex) {
      item = trimStr(item);
      if (wordIndex == "0") {
        return true;
      }
      if (data[item]) {
        outData[wordIndex][dataIndex] = data[item];
      } else {
        outData[wordIndex][dataIndex] = {
          v: "",
          s: {
            fill: {
              fgColor: { rgb: "FFC5C5" }
            }
          }
        };
      }
    });
  });
}

function trimJson(jsonObj) {
  let str = JSON.stringify(jsonObj).toString(),
    leftReg = /\"\s+/g,
    rightReg = /\s+\"/g,
    btwReg = /\s{2,}/g;
  str = str.replace(leftReg, '"').replace(rightReg, '"').replace(btwReg, " ");
  unescape(str);
  return JSON.parse(str);
}

function trimStr(str) {
  let leftReg = /\"\s+/g,
    rightReg = /\s+\"/g,
    btwReg = /\s{2,}/g;
  str = str.replace(leftReg, '"').replace(rightReg, '"').replace(btwReg, " ");
  unescape(str);
  return str;
}
export default ExtractLangExcel;

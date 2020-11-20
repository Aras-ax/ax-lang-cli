import transHelper from "./lib";

/**
 * 提取词条
 * */
function getWords(content, onlyZH) {
  return new transHelper.getWords(content, onlyZH);
}

/**
 * 翻译检查, 返回未翻译词条
 */
function checkTranslate(content, langData, onlyZH) {
  let words = new transHelper.getWords(content, onlyZH);

  let untransWords = [];

  for (let i = 0, l = words.length; i < l; i++) {
    let curItem = words[i];
    if (curItem && new RegExp("^/\\*-").test(curItem)) {
      untransWords.push(curItem);
    } else {
      if (langData[curItem] === undefined) {
        untransWords.push(curItem);
      }
    }
  }
  return untransWords;
}

/**
 * 翻译文件
 */
function translate(content) {
  content = transHelper.translate(content);
  return { content, untrans: transHelper.getUntrans() };
}

export default function extractRegexp({
  data, // 语言包
  content,
  isTranslate,
  isCheckTrans,
  onlyZH,
  CONFIG_HONG
}) {
  global.CONST = CONFIG_HONG || {};

  return new Promise((resolve, reject) => {
    try {
      transHelper.setData(data);
      // 翻译检查
      if (isCheckTrans) {
        resolve(checkTranslate(content, data, onlyZH));
      } else if (isTranslate) {
        // 翻译文件
        resolve(translate(content));
      } else {
        // 提取词条
        resolve(getWords(content, onlyZH));
      }
    } catch (e) {
      console.log(e);
      reject();
    }
  });
}

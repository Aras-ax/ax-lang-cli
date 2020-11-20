import { loadExcel, writeExcel, log, LOG_TYPE, getDirname } from "./util/index";
import path from "path";

var outPath = "";
function checkLangExcel(option) {
  var outData = loadExcel(option.outExcel, option.sheetName1),
    keyValueRow1 = outData.shift(),
    outputData = [],
    outputDataLower = [],
    keyIndex1 = "-1";
  (keyValueRow1 = keyValueRow1.join(",").toUpperCase().split(",")),
    (keyIndex1 = keyValueRow1.indexOf(option.keyName1));

  if (keyIndex1 === -1) {
    log(`Excel中不存在${option.keyName1}列`, LOG_TYPE.ERROR);
    return -1;
  }

  if (outData.length === 0) {
    return outputData;
  }

  outData.forEach(function (item) {
    outputData.push(trim(item[keyIndex1].toString()));
    outputDataLower.push(trim(item[keyIndex1].toString().toLowerCase()));
  });

  var inData = loadExcel(option.inExcel, option.sheetName2),
    keyValueRow2 = inData.shift(),
    inputData = [],
    inputDataLower = [],
    keyIndex2 = "-1";

  keyValueRow2 = keyValueRow2.join(",").toUpperCase().split(",");
  keyIndex2 = keyValueRow2.indexOf(option.keyName2);

  if (keyIndex2 === -1) {
    log(`Excel中不存在${option.keyName2}列`, LOG_TYPE.ERROR);
    return -1;
  }

  if (inData.length === 0) {
    return inputData;
  }

  inData.forEach(function (item) {
    inputData.push(trim(item[keyIndex2].toString()));
    inputDataLower.push(trim(item[keyIndex2].toString().toLowerCase()));
  });

  var noExistData = ["**********未翻译的词条***********"],
    diffCaseData = ["**********大小写被修改的词条***********"],
    existData = ["**********已完成翻译的词条*********"],
    indexItem = -1;

  outputData.forEach(function (outputItem, index) {
    indexItem = inputData.indexOf(outputItem);
    if (indexItem == "-1") {
      indexItem = inputDataLower.indexOf(outputItem.toLowerCase());
      if (indexItem == "-1") {
        log(
          `资料部提供的语言包中不包含最初提供的词条${outputItem},查看是否进行了优化或漏翻`,
          LOG_TYPE.ERROR
        );
        noExistData.push(outputItem);
      } else {
        log(
          `资料部提供的语言包中不包含最初提供的词条${outputItem},但存在与其大小写不同的词条`,
          LOG_TYPE.ERROR
        );
        diffCaseData.push(`${outputItem}-${inputData[indexItem]}`);
        inputData.splice(indexItem, 1);
        inputDataLower.splice(indexItem, 1);
      }
    } else {
      // log(`${outputItem}在资料提供的语言包中第${inputData.indexOf(outputItem)}行`, LOG_TYPE.LOG);
      existData.push(outputItem);
      inputData.splice(indexItem, 1);
      inputDataLower.splice(indexItem, 1);
    }
    // outputData.splice(index, 1);
  });
  outPath = path.join(
    getDirname(option.outExcel),
    `checkLangExcel${new Date().getTime()}.xlsx`
  );
  if (noExistData.length == 1 && diffCaseData.length == 1) {
    log(`对比完成，提取的词条已经全部翻译，可以进行导入`);
  } else {
    var data = noExistData.concat(diffCaseData).concat(existData);
    try {
      writeExcel(data, outPath, "对比结果");
      log(`对比完成，部分词条未翻译，具体查看文件${outPath}`);
    } catch (e) {
      log(`写入excel失败，${e}`, LOG_TYPE.ERROR);
      return {};
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

export default checkLangExcel;

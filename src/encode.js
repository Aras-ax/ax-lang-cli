const jschardet = require("jschardet");
const iconv = require("iconv-lite");
const fs = require("fs");
const path = require("path");
const minimatch = require("minimatch");
import { scanFolder, createFolder, log, LOG_TYPE } from "./util/index";

import { EXCLUDE_FILE, TRANS_EXCLUDE } from "./util/config";

function scanFile(filePath) {
  let stats = fs.statSync(filePath);
  if (stats.isDirectory()) {
    return scanFolder(filePath);
  }
  return {
    files: [filePath],
    folders: []
  };
}

function transCode(filePath, outPath, encode = "UTF-8") {
  let fsData = scanFile(filePath);

  // 创建文件目录
  createFolder(outPath);
  fsData.folders.forEach((item) => {
    createFolder(path.join(outPath, path.relative(filePath, item))); //创建目录
  });

  fsData.files.forEach((file) => {
    try {
      let outUrl = path.join(outPath, path.relative(filePath, file));
      // .cgi等文件直接拷贝
      if (minimatch(file, EXCLUDE_FILE) || minimatch(file, TRANS_EXCLUDE)) {
        fs.createReadStream(file).pipe(fs.createWriteStream(outUrl));
        return true;
      }

      let fileData = fs.readFileSync(file),
        oldEncode = jschardet.detect(fileData).encoding,
        data = iconv.decode(fileData, oldEncode);

      // encode编码直接拷贝
      let lowCaseCode = oldEncode.toLowerCase();
      if (
        lowCaseCode === encode.toLowerCase() ||
        lowCaseCode.replace("-", "") === encode.toLowerCase()
      ) {
        fs.createReadStream(file).pipe(fs.createWriteStream(outUrl));
        return true;
      }

      // 写入文件
      fs.writeFile(outUrl, data, { encoding: encode }, function (err) {
        if (err) {
          log(`文件${file}转码失败，直接拷贝！`, LOG_TYPE.WARNING);
          fs.createReadStream(file).pipe(fs.createWriteStream(outUrl));
          return;
        }
        log(`文件${file}转码成功！`);
      });
    } catch (e) {
      log(`文件${file}转码失败，直接拷贝！`, LOG_TYPE.WARNING);
      fs.createReadStream(file).pipe(
        fs.createWriteStream(path.join(outPath, path.relative(filePath, file)))
      );
    }
  });
}

export default transCode;

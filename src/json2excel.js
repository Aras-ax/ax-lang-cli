import { loadJson, writeExcel, LOG_TYPE, log } from "./util/index";
import path from "path";

function json2excel(jsonPath, outPath) {
  let exceldata = [["EN", "CN"]];
  loadJson(jsonPath)
    .then((data) => {
      if (Array.isArray(data)) {
        data = data.map((item) => [item]);
      } else {
        for (let key in data) {
          exceldata.push([key, data[key]]);
        }
      }

      if (!path.extname(outPath)) {
        outPath = path.join(outPath, "json2Excel.xlsx");
      }

      return writeExcel(exceldata, outPath, "EN-CN");
    })
    .then((data) => {
      log(`Json to Excel 文件已写入地址-${outPath}`);
      return data;
    })
    .catch((error) => {
      log(`Json to Excel 失败，${error}`, LOG_TYPE.ERROR);
      return {};
    });
}

export default json2excel;

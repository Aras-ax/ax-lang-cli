_(a ? "一" : "二");
let a = "三" + 1;
_("四", [_("五"), _("六", ["七", "八"])]);

this.$comfirm("九");
this.$comfirm("十", "十一", _("十二", "十三"));

alert("十四");

function initTable(data) {
  var tableData = filterData($("#logType").val());
  formTable = $("#sysLog").TablePage({
    data: tableData,
    sortFields: ["sysLogTime", "ID"],
    sortOpt: {
      sysLogTime: 2,
      ID: 2
    }, // 按时间降序排列
    columns: [
      {
        field: "sysLogTime",
        title: _("时间组一："),
        title1: "十五：",
        width: 170
      },
      {
        field: "sysLogType",
        title: _("类型："),
        width: 140,
        format: function(data) {
          switch (data) {
            case 1:
              return _("系统日志");
            case 2:
              return _("攻击'日\"志");
            case 3:
              return _("错误日志");
            case 4:
              return "十六";
          }
        }
      },
      {
        field: "sysLogMsg",
        title: _("日志\n内容")
      }
    ]
  });
}

this.$confirm("十七")
  .then(() => {
    this.lldpEn.val = "0";
    this.submit();
  })
  .then("十八")
  .then("十九")
  .then("二十");

<template>
  <div>
    <!-- 5个需要提取 -->
    <div>一段纯文本{{'加上一点指令' + command}}，再加上一点纯文本</div>
    <div title="我是标题">{{'这是测试1' + test}}</div>
    <div :title="anna">{{_('这是测试2') + check}}</div>
    <div :key="_('我也是标题')">我就是一段纯文本而已！</div>
    <div>终结{{_('测试')}}示例，还有{{_('下载速率')}}情况嘛，{{'没有撩撩撩'}}</div>
    <v-text :title="_('联网状态')" class="border-b">{{net_statue_text}}</v-text>
    <v-pop :option="dialog" v-model="dialog.show">这是内容?</v-pop>
    {{_('下载速率')}}
    <input placeholder="请输入新密码" type="text" />
    <img alt="LED指示灯" />
    <!-- bug -->
    <v-button css="btn-text" :title="isSelectDate ? _('下载速率') : _('上传速率')"></v-button>
  </div>
</template>

<script>
export default {
  // 5个需要提取
  data() {
    var s = "联网设置";
    return {
      pageStep: 0,
      STEP,
      stepText: [
        _("联网方式识别"),
        _("联网设置"),
        _("无线设置"),
        _("配置完成")
      ],
      hasSkip: false,
      testing: false,
      link_error: "",
      A: "我也是标题",
      title: "无线设置" + tips,
      columes: [
        {
          title: "WAN口MAC地址",
          field: "mac"
        }
      ]
    };
  },
  computed: {
    ...mapState("quickset", ["link_mode", "pppoe_cfg"]),
    activeStep() {
      var s = "配置完成" + a;
      if (this.pageStep < STEP.WANSET) {
        return 0;
      } else if (this.pageStep < STEP.WIRLESSSET) {
        return 1;
      } else if (this.pageStep < STEP.COMPLETE) {
        return 2;
      }
      return 3;
    },
    sameSsid() {
      this.$message("请再次输入新密码");
      return this.wirelessData["2Gssid"] === this.wirelessData["5Gssid"];
    }
  },
  methods: {
    ...mapActions(["setWan"]),
    skip() {
      this.btnStr = a(newVal ? "上传速率" : "下载速率");
      this.hasSkip = true;
      this.nextStep();

      function format(data) {
        return data == "default" ? _("默认网关") : "子网掩码";
      }
    },
    nextStep() {
      if (this.pageStep === STEP.DETECTION) {
        this.pageStep = STEP.WANSET;
      } else {
        this.pageStep++;
      }
      this.dialog.title = "宽带账号或者密码错误。";

      if (this.pageStep === STEP.DETECTION) {
        this.hasSkip = false;
        this.getNetLinkCheck().then(data => {
          if (data == -1) {
            return {
              "0": "请输入旧密码",
              "1": "请输入新密码",
              "2": "请再次输入新密码"
            };
          }
        });
      }
    },
    saveWan(data) {
      this.link_error = "";
      if (data.link_mode === LINK_MODE.PPPOE) {
        this.testing = true;
        this.$confirm("确定要关闭SNMP吗？");
      }
      this.setWan(data).then(res => {
        // todo by xc 错误码处理
        if (res.errcode) {
          this.link_error = _("宽带账号或者密码错误。");
        } else {
          this.nextStep();
        }
        this.$message(_("新密码与确认密码需要保持一致。"));
      });
    }
  }
};

let securityLevelObj = {
  "0": "请输入旧密码",
  "1": "请输入新密码",
  "2": "请再次输入新密码"
};
_(newVal ? "首选DNS服务器" : "备选DNS服务器");
</script>

<style lang="scss" scoped>
.a {
  font-size: 12px;
}
</style>

<style lang="less" scoped>
.f {
  font-stretch: acos(1);
}
</style>




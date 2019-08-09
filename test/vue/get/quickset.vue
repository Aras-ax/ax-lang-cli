<template>
  <div>
    <!-- 5个需要提取 -->
    <div>一段纯文本{{'加上一点指令' + command}}，再加上一点纯文本</div>
    <div title="我是标题">{{'这是测试1' + test}}</div>
    <div :title="anna">{{_('这是测试2') + check}}</div>
    <div :key="_('我也是标题')">我就是一段纯文本而已！</div>
    <div>终结{{_('测试')}}示例，还有{{another}}情况嘛，{{'没有撩撩撩'}}</div>
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
      link_error: ""
    };
  },
  computed: {
    ...mapState("quickset", ["link_mode", "pppoe_cfg"]),
    activeStep() {
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
      return this.wirelessData["2Gssid"] === this.wirelessData["5Gssid"];
    }
  },
  methods: {
    ...mapActions(["setWan"]),
    skip() {
      this.hasSkip = true;
      this.nextStep();
    },
    nextStep() {
      if (this.pageStep === STEP.DETECTION) {
        this.pageStep = STEP.WANSET;
      } else {
        this.pageStep++;
      }

      if (this.pageStep === STEP.DETECTION) {
        this.hasSkip = false;
        this.getNetLinkCheck().then(data => {
          if (data == -1) {
            //
          }
        });
      }
    },
    saveWan(data) {
      this.link_error = "";
      if (data.link_mode === LINK_MODE.PPPOE) {
        this.testing = true;
      }
      this.setWan(data).then(res => {
        // todo by xc 错误码处理
        if (res.errcode) {
          this.link_error = _("宽带账号或者密码错误。");
        } else {
          this.nextStep();
        }
      });
    }
  }
};
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




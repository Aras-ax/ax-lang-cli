<template>
<div>
    <!-- 5个需要提取 -->
    <div>{{_('一段纯文本加上一点指令%s，再加上一点纯文本', [command])}}</div>
    <div :title="_('this is title')">{{_('this is test one %s', [test])}}</div>
    <div :title="anna">{{_('this is test two') + check}}</div>
    <div :key="_('I am title too')">{{_('Just a pure text message.')}}</div>
    <div>终结{{_('Text')}}示例，还有{{_('Download Speed')}}情况嘛，{{'没有撩撩撩'}}</div>
    <v-text :title="_('Link Status')" class="border-b">{{net_statue_text}}</v-text>
    <v-pop :option="dialog" v-model="dialog.show">{{_('Is this content?')}}</v-pop>
    {{_('Download Speed')}}
    <input :placeholder="_('Please enter new password')" type="text" />
    <img :alt="_('LED Light')" />
    <!-- bug -->
    <v-button css="btn-text" :title="isSelectDate ? _('Download Speed') : _('Upload Speed')"></v-button>
  </div>
</template>

<script>
export default {
  // 5个需要提取
  data() {
    return {
      pageStep: 0,
      STEP,
      stepText: [_("Check Link Type"), _("Lan set"), _("Wireless Set"), _("Completed")],
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
          this.link_error = _("Password/Account Error");
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


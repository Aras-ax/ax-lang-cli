<template>
  <div>
    <div title="我是标题">{{'这是测试1' + test}}</div>
    <div :title="anna">{{_('这是测试2') + check}}</div>
    <div :key="_('我也是标题')">我就是一段纯文本而已！</div>
    <v-pop :option="dialog" v-model="dialog.show">这是内容：{{coneten + mess}}</v-pop>
  </div>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        old_pwd: {
          placeholder: _("请输入旧密码"),
          required: true
        },
        new_pwd: {
          placeholder: _("请输入新密码"),
          required: true,
          changeCallBack(val) {
            this.error = _("新密码与确认密码需要保持一致。");
          }
        }
      }
    };
  }
};
</script>

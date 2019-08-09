<template>
<div>
    <div :title="_('this is title')">{{_('this is test one %s', [test])}}</div>
    <div :title="anna">{{_('this is test two') + check}}</div>
    <div :key="_('I am title too')">{{_('Just a pure text message.')}}</div>
    <v-pop :option="dialog" v-model="dialog.show">{{_('this is content: %s%s', [coneten, mess])}}</v-pop>
  </div>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        old_pwd: {
          placeholder: _("Please enter old password"),
          required: true
        },
        new_pwd: {
          placeholder: _("Please enter new password"),
          required: true,
          changeCallBack(val) {
            this.error = _("Confirm old and new");
          }
        }
      }
    };
  }
};
</script>


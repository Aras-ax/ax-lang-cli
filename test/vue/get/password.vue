<template>
  <v-form class="form-wrapper" @submit="submit" :formData="formData" :beforeSubmit="validate">
    <v-group :title="_('旧密码')" vname="v-input" :dataKey="formData.old_pwd"></v-group>
    <v-group :title="_('新密码')" vname="v-input" :dataKey="formData.new_pwd"></v-group>
    <v-group :title="_('确认密码')" vname="v-input" :dataKey="formData.new_pwd_confirm"></v-group>
  </v-form>
</template>

<script>
import { mapActions } from "vuex";

export default {
  data() {
    let _this = this;
    return {
      formData: {
        old_pwd: {
          placeholder: _("请输入旧密码"),
          required: true,
          hasEye: true,
          maxlength: 63,
          type: "password",
          valid: [
            {
              type: "ascii",
              args: [8, 63]
            }
          ]
        },

        new_pwd: {
          placeholder: _("请输入新密码"),
          required: true,
          hasEye: true,
          maxlength: 63,
          type: "password",
          valid: [
            {
              type: "ascii",
              args: [8, 63]
            }
          ],
          changeCallBack(val) {
            if (_this.formData.new_pwd_confirm.val === val) {
              _this.formData.new_pwd_confirm.error = "";
            } else if (
              _this.formData.new_pwd_confirm.val !== "" &&
              _this.formData.new_pwd_confirm.error === ""
            ) {
              this.error = _("新密码与确认密码需要保持一致。");
            }
          }
        },

        new_pwd_confirm: {
          placeholder: _("请再次输入新密码"),
          required: true,
          hasEye: true,
          maxlength: 63,
          type: "password",
          valid: [
            {
              type: "ascii",
              args: [8, 63]
            }
          ],
          changeCallBack(val) {
            if (_this.formData.new_pwd.val === val) {
              _this.formData.new_pwd.error = "";
            } else if (
              _this.formData.new_pwd.val !== "" &&
              _this.formData.new_pwd.error === ""
            ) {
              this.error = _("新密码与确认密码需要保持一致。");
            }
          }
        }
      }
    };
  },
  methods: {
    ...mapActions(["setPassword"]),
    validate(formData) {
      if (formData.new_pwd.val !== formData.new_pwd_confirm.val) {
        formData.new_pwd_confirm.error = _("新密码与确认密码需要保持一致。");
        return false;
      }
    },
    submit() {
      this.setPassword({
        old_pwd: this.formData.old_pwd.val,
        new_pwd: this.formData.new_pwd.val
      });
    }
  }
};
</script>

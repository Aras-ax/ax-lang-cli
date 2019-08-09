<template>
  <div class="form-wrapper">
    <v-group title="复选框" vname="v-checkbox" :dataKey="checkbox"></v-group>
    <v-group title="下拉框" vname="v-select" :dataKey="select"></v-group>
    <v-group title="单选框" vname="v-radio" :dataKey="radio"></v-group>
    <v-group title="文本框" vname="v-input" :dataKey="input"></v-group>
    <v-group title="文本框1" vname="v-input" :dataKey="input1"></v-group>
    <v-group title="滑块" vname="v-slider" :dataKey="slider"></v-group>
    <v-group title="开关" vname="v-switch" :dataKey="switcht"></v-group>
    <v-text title="标题" content="内容"></v-text>
    <v-collapse></v-collapse>

    <v-button title="pop" :callback="showAlert"></v-button>
    <v-button title="message" :callback="message"></v-button>
    <v-button title="confirm" :callback="confirmt"></v-button>
    <v-button title="alert" :callback="alertt"></v-button>
    <v-pop :option="dialog" v-model="dialog.show">这是内容?</v-pop>
  </div>
</template>

<script>
export default {
  data() {
    return {
      select: {
        val: "",
        hasManual: true,
        manualText: "手动设置",
        sortArray: [
          {
            title: "option 1",
            value: "1"
          },
          {
            title: "option 2",
            value: "2"
          },
          {
            title: "option 3",
            value: "3"
          }
        ],
        valid: {
          type: "ascii"
        }
      },
      checkbox: {
        title: _("Login"),
        sortArray: [
          {
            value: 2,
            title: "label 2"
          },
          {
            value: 0,
            title: "label 0"
          },
          {
            value: 1,
            title: "label 1"
          }
        ],
        val: [2],
        changeCallBack(value) {
          console.log("radio value ", value);
        }
      },
      radio: {
        title: _("Login"),
        sortArray: [
          {
            value: 2,
            title: "label 2"
          },
          {
            value: 0,
            title: "label 0"
          },
          {
            value: 1,
            title: "label 1"
          }
        ],
        //or
        options: {
          1: "label 1",
          2: "label 2",
          0: "label 0"
        },
        val: 2,
        changeCallBack(value) {
          console.log("radio value ", value);
        }
      },
      input: {
        css: "input-small",
        placeholder: "Login Password",
        key: "",
        hasEye: true,
        type: "password",
        valid: {
          type: "ascii"
        }
      },
      input1: {
        css: "input",
        placeholder: "Login Accout",
        key: "",
        type: "text",
        valid: {
          type: "ascii"
        }
      },
      slider: {
        min: 0,
        max: 100
      },
      switcht: {
        val: true
      },
      alertpop: {
        show: false //是否显示
      },
      dialog: {
        title: "这是标题title",
        isMobile: false,
        show: false,
        buttons: [
          {
            text: "确定",
            theme: "active",
            callback() {
              alert(1);
            }
          },
          {
            text: "取消",
            callback() {
              alert("取消");
            }
          }
        ]
      }
    };
  },
  methods: {
    setData(data) {
      // this.select.val = data.select;
      // this.checkbox.val = data.radio;
      // this.radio.val = data.radio;
      // this.input.val = data.input;
      // this.slider.val = data.slider;
    },
    fetchData() {
      this.$http.getData("", "/goform/getSysInfo").then(data => {
        this.setData(data);
      });
    },
    showAlert() {
      this.dialog.show = true;
    },
    confirmt() {
      this.$confirm("this is confirm");
    },
    message() {
      this.$message("this is message", 100000);
    },
    alertt() {
      this.$alert("this is alert");
    }
  },
  created() {
    this.fetchData();
  }
};
</script>
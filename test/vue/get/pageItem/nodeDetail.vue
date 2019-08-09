<template>
  <div class="wan-mess">
    <v-text :title="_('联网状态')" class="border-b">{{net_statue_text}}</v-text>
    <v-text :title="_('连接质量')" class="border-b">{{link_mode_text}}</v-text>
    <v-text :title="_('序列号')" class="border-b">{{cur_node_detail.sn}}</v-text>
    <!-- <v-group :title="_('LED指示灯')" class="border-b" vname="v-switch" :dataKey="led"></v-group> -->
    <v-group :title="_('LED指示灯')" class="border-b">
      <v-switch :dataKey="led"></v-switch>
    </v-group>
    <v-collapse :title="_('设备位置')" class="text-group">
      <v-group vname="v-radio" :dataKey="locate"></v-group>
      <v-group vname="v-input" class="locate-input" :dataKey="locateInput"></v-group>
    </v-collapse>
    <v-collapse :title="_('更多信息')" class="text-group more-text">
      <v-text :title="_('型号')">{{cur_node_detail.dut_name}}</v-text>
      <v-text :title="_('软件版本')">{{cur_node_detail.dut_version}}</v-text>
      <v-text :title="_('序列号')">{{cur_node_detail.sn}}</v-text>
      <v-text :title="_('IP地址')">{{cur_node_detail.ip}}</v-text>
      <v-text :title="_('WAN口MAC地址')">{{cur_node_detail.wan_mac}}</v-text>
      <v-text :title="_('LAN口MAC地址')">{{cur_node_detail.lan_mac}}</v-text>
      <v-text :title="_('2.4GWiFi MAC地址')">{{cur_node_detail['2Gwifi_mac']}}</v-text>
      <v-text :title="_('5G WiFi MAC地址')">{{cur_node_detail['5Gwifi_mac']}}</v-text>
    </v-collapse>
  </div>
</template>
<script>
import { mapState, mapGetters, mapActions } from "vuex";
import { NODE_STATUS_TEXT, INDEX_TO_LOCATE } from "@/libs/config.js";

let locateList = [];
for (let key in INDEX_TO_LOCATE) {
  locateList.push({
    title: INDEX_TO_LOCATE[key],
    value: key
  });
}

export default {
  data() {
    let _this = this;
    return {
      led: {
        values: ["1", "0"],
        val: "0",
        immediate: false,
        events: {
          click: this.changeLed
        }
      },
      locate: {
        sortArray: locateList,
        events: {
          click: this.changeLocate
        }
      },
      locateInput: {
        placeholder: _("输入自定义"),
        events: {
          blur: this.changeLocate
        }
      }
    };
  },
  computed: {
    ...mapGetters(["net_statue_text"]),
    ...mapState("sysinfo", ["cur_node"]),
    ...mapGetters("sysinfo", ["sn_to_node"]),
    cur_node_detail() {
      let data = this.sn_to_node[this.cur_node];
      this.led.val = data.led;
      this.locate.val = data.location;
      return data;
    },
    link_mode_text() {
      return NODE_STATUS_TEXT[this.cur_node_detail.net_status];
    }
  },
  watch: {
    "cur_node_detail.led"(val) {
      this.led.val = val;
    },
    "cur_node_detail.location"(val) {
      this.locate.val = val;
    }
  },
  methods: {
    ...mapActions("sysinfo", ["setLed", "setLocate"]),
    changeLed(val) {
      this.setLed({
        led_en: val,
        sn: this.cur_node_detail.sn
      });
    },
    changeLocate(target) {
      let locate =
        target.tagName === "INPUT" ? this.locateInput.val : this.locate.val;

      this.setLocate({
        location: locate,
        sn: this.cur_node_detail.sn
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.wan-mess {
  border: 1px solid $color-border;
  margin-top: 60px;
  border-bottom: 0;

  .form-group {
    margin-bottom: 0;
    // border-bottom: 1px solid $color-border;
    padding: 0 0.2rem;
    &:last-child {
      border-bottom: 0;
    }
  }
}

.text-group {
  &.v-collapse {
    padding: 0;
  }
}

.locate-input {
  margin-top: 0.2rem;
}
</style>

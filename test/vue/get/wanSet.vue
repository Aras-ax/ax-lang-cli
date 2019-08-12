<template>
  <!-- todo by xc 确认默认mac地址的来源 -->
  <v-wan class="form-wrapper" :mac="wan_info.mac" @submit="submit" :formData="wan_data">
    <v-group :title="_('联网状态')" vname="v-input" :class="['status-text', net_color]" :dataKey="wanStatus"></v-group>
  </v-wan>
</template>
 
<script>
import { mapActions, mapState, mapGetters } from "vuex";
import { NET_STATUS } from "@/libs/config.js";
import vWan from "../components/v-wan";
import { clearInterval, setInterval } from "timers";

export default {
  data() {
    return {
      wanStatus: {
        val: "联网状态",
        disabled: true
      }
    };
  },
  computed: {
    ...mapState(["wan_data", "net_status"]),
    ...mapGetters(["net_statue_text"]),
    ...mapState("sysinfo", ["wan_info"]),
    net_color() {
      let colors = {
        [NET_STATUS.UNPLUG]: "error",
        [NET_STATUS.UN_CONNECTED]: "error",
        [NET_STATUS.LINKING]: "",
        [NET_STATUS.CONNECTED]: ""
      };
      return colors[this.net_status];
    }
  },
  watch: {
    net_statue_text(val) {
      this.wanStatus.val = val;
    }
  },
  components: {
    vWan
  },
  methods: {
    ...mapActions(["getWanData", "setWan", "getNetStatus"]),
    submit(data) {
      this.setWan(data);
    },
    getStatus() {
      this.interval && clearInterval(this.interval);
      this.interval = setInterval(() => {
        this.getNetStatus();
      }, 5000);
    }
  },
  created() {
    this.getWanData();
    this.getStatus();
  },
  destroyed() {
    this.interval && clearInterval(this.interval);
  }
};
</script>

<style lang="scss">
.status-text {
  .form-content {
    line-height: 1;
  }
  .text {
    padding-left: 0;
    border: 0;
    height: 20px;
    line-height: 1;
    color: #57bf13;
    background-color: transparent;
  }

  &.error {
    .text {
      color: #ff2701;
    }
  }

  &.form-group.disabled {
    background-color: transparent;
  }
}
</style>

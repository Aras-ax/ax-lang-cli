<template>
  <div class="wan-mess">
    <v-text :title="_('联网状态')">{{net_statue_text}}</v-text>
    <v-text :title="_('联网方式')">{{link_mode_text}}</v-text>
    <v-text :title="_('ip地址')">{{wan_info.ip}}</v-text>
    <v-text :title="_('子网掩码')">{{wan_info.netmask}}</v-text>
    <v-text :title="_('默认网关')">{{wan_info.gw}}</v-text>
    <v-text :title="_('首选DNS服务器')">{{wan_info.first_dns}}</v-text>
    <v-text :title="_('备选DNS服务器')">{{wan_info.sec_dns}}</v-text>
  </div>
</template>
<script>
import { mapState, mapGetters } from "vuex";
import { LINK_MODE_TEXT } from "@/libs/config.js";

export default {
  computed: {
    ...mapState(["link_module"]),
    ...mapGetters(["net_statue_text"]),
    ...mapState("sysinfo", ["wan_info"]),
    link_mode_text() {
      return LINK_MODE_TEXT[this.link_module.link_mode];
    }
  }
};
</script>

<style lang="scss" scoped>
.wan-mess {
  border: 1px solid $color-border;
  margin-top: 60px;

  .form-group {
    margin-bottom: 0;
    border-bottom: 1px solid $color-border;
    padding: 0 0.2rem;
    &:last-child {
      border-bottom: 0;
    }
  }
}
</style>

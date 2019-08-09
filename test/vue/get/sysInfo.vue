<template>
  <!-- <v-form class="form-wrapper"></v-form> -->
  <div class="sysinfo">
    <transition>
      <div v-if="!sub_direct">
        <div class="sys-net clear-fix">
          <div class="sys-net-speed float-l clear-fix">
            <div class="sys-net-des float-r">
              <div class="nowarp align-l">{{speed.down_unit}}</div>
              <div class="nowarp">
                {{_('下载速率')}}
                <i class="icon-download"></i>
              </div>
            </div>
            <div class="sys-net-num float-r">{{speed.down_speed}}</div>
          </div>
          <div class="sys-net-speed float-r clear-fix">
            <div class="sys-net-num float-l">{{speed.up_speed}}</div>
            <div class="sys-net-des float-l">
              <div class="nowarp align-l">{{speed.up_unit}}</div>
              <div class="nowarp">
                {{_('上传速率')}}
                <i class="icon-upload"></i>
              </div>
            </div>
          </div>
          <div class="sys-net-icon">
            <i class="icon-world" @click="wanDetail"></i>
          </div>
          <i class="net-line"></i>
        </div>
        <div class="sys-mesh">
          <topology :data="node_info" @nodeClick="nodeDetail"></topology>
          <div v-if="node_info.length < 6" class="svg-tool align-c">
            <i class="icon-add" @click="addNode"></i>
          </div>
        </div>
        <div class="sys-wifi">
          <div class="sys-wifi-row">
            <div class="sys-wifi-title border-b">{{_('SSID')}}</div>
            <div class="sys-wifi-mess">
              <label class="margin-60">2.4G: {{wan_info['2Gssid']}}</label>
              <label>5G: {{wan_info['5Gssid']}}</label>
            </div>
          </div>
          <div class="sys-wifi-row">
            <div class="sys-wifi-title border-b">{{_('WAN口IP')}}</div>
            <div class="sys-wifi-mess">{{wan_info.ip}}</div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <wan-detail v-if="sub_direct && is_wan_detail"></wan-detail>
    </transition>

    <transition name="fade">
      <nodeDetail v-if="sub_direct && is_node_detail"></nodeDetail>
    </transition>

    <pop-search v-model="showSearchPop"></pop-search>
  </div>
</template>

<script>
import topology from "../components/v-topology";
import { mapMutations, mapActions, mapState } from "vuex";
import * as types from "@/store/types.js";
import wanDetail from "./pageItem/wanDetail.vue";
import nodeDetail from "./pageItem/nodeDetail.vue";
import popSearch from "./pageItem/popSearch.vue";
import "../css/sysinfo.scss";

export default {
  data() {
    return {
      showSearchPop: false,
      is_wan_detail: false,
      is_node_detail: false
    };
  },
  components: {
    topology,
    wanDetail,
    nodeDetail,
    popSearch
  },
  watch: {
    sub_direct(val) {
      if (val === "") {
        this.is_wan_detail = this.is_node_detail = false;
      }
    }
  },
  computed: {
    ...mapState("sysinfo", ["wan_info", "node_info"]),
    ...mapState(["sub_direct"]),
    speed() {
      let speed = {
        up_unit: "Kbps",
        up_speed: +this.wan_info.up_speed,
        down_unit: "Kbps",
        down_speed: +this.wan_info.down_speed
      };
      // NaN或小于0
      if (speed.up_speed !== speed.up_speed || speed.up_speed < 0) {
        speed.up_speed = "0";
      } else if (speed.up_speed > 1024) {
        speed.up_speed = (speed.up_speed / 1024).toFixed(2);
        speed.up_unit = "Mbps";
      }

      if (speed.down_speed !== speed.down_speed || speed.down_speed < 0) {
        speed.down_speed = "0";
      } else if (speed.down_speed > 1024) {
        speed.down_speed = (speed.down_speed / 1024).toFixed(2);
        speed.down_unit = "Mbps";
      }
      return speed;
    }
  },
  methods: {
    ...mapMutations([types.SET_SUB_DIRECT]),
    ...mapMutations("sysinfo", [types.SET_CUR_NODE]),
    ...mapActions("sysinfo", ["getSysInfo"]),
    ...mapActions(["getLinkModule", "getNetStatus"]),
    getData() {
      this.getSysInfo();
      this.getNetStatus();
      this.getLinkModule();
    },
    wanDetail() {
      this[types.SET_SUB_DIRECT](_("联网信息"));
      this.is_wan_detail = true;
    },
    nodeDetail(sn) {
      this[types.SET_CUR_NODE](sn);
      this[types.SET_SUB_DIRECT](_("节点信息"));
      this.is_node_detail = true;
    },
    addNode() {
      this.showSearchPop = true;
    }
  },
  beforeRouteLeave(to, from, next) {
    this[types.SET_SUB_DIRECT](_(""));
    this.interval && clearInterval(this.interval);
    next();
  },
  created() {
    this.getData();
    this.interval && clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.getData();
    }, 5000);
  }
};
</script>
<template>
  <div>
    <v-pop v-model="showSearchPop">
      <div class="mesh-search align-c" v-show="searchStatus === STATUS.START">
        <img src="@/assets/img/reset.png" alt />
        <div class="search-text">{{_('请按一下被添加设备的reset键1~3秒，使之变更为2分钟内可被添加状态，然后点击搜索按键。')}}</div>
        <div class="pop-box-toolbar search-wrapper">
          <v-button class="pop-btn active" @callback="search" :title="_('搜索')"></v-button>
          <v-button class="pop-btn" @callback="nextStep(STATUS.CUSTOM)" :title="_('手动添加')"></v-button>
        </div>
      </div>
      <div class="search-box" v-show="searchStatus === STATUS.SEARCH">
        <div class="searching" v-if="is_searching">
          <div class="icon-wrapper">
            <i class="icon-check"></i>
            <div class="tip-text">{{_('搜索中...')}}</div>
          </div>
        </div>
        <div v-else>
          <div class="search-data" v-if="add_list.length > 0">
            <h4>{{_('发现可添加的设备')}}</h4>
            <div class="mesh-wrapper scroll">
              <div class="mesh-box" :style="{paddingTop: `${paddingTop}rem`}">
                <div v-for="item in add_list_data" :key="item.id" @click="item.val = !item.val" class="mesh-item clear-fix">
                  <div class="mesh-icon float-l">
                    <img src="@/assets/img/device.png" alt />
                  </div>
                  <div class="mesh-text top-text">
                    SN:
                    <label>{{item.sn}}</label>
                  </div>
                  <div class="mesh-text">
                    MAC:
                    <label>{{item.mac}}</label>
                  </div>
                  <div class="mesh-check">
                    <v-checkbox :data-key="item"></v-checkbox>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="search-no-data" v-else>
            <img class="img-nodata" src="@/assets/img/nodata.png" alt />
            <div class="tip-text">{{_('无可添加的设备！')}}</div>
          </div>
          <div class="pop-box-toolbar">
            <v-button class="pop-btn active" @callback="search" :title="_('重新搜索')"></v-button>
            <v-button class="pop-btn" v-show="add_list.length > 0" @callback="addNodes('list')" :title="_('添加')"></v-button>
          </div>
        </div>
      </div>
      <div class="add-box" v-show="searchStatus === STATUS.CUSTOM">
        <div class="add-wrapper">
          <v-group vname="v-input" :dataKey="sn" :title="_('输入设备机身上的SN码')"></v-group>
        </div>
        <div class="pop-box-toolbar">
          <v-button class="pop-btn active" @callback="addNodes" :title="_('添加')"></v-button>
        </div>
      </div>
      <div class="success-box" v-show="searchStatus === STATUS.SUCCESS">
        <div class="icon-wrapper">
          <i class="icon-check"></i>
          <div class="tip-text">{{_('添加成功')}}</div>
        </div>
      </div>
    </v-pop>
    <!-- 删除确认 -->
    <v-pop :option="confirm" v-model="confirm.show">{{_('删除该节点可能会降低您的网络覆盖范围，影响您的上网体验。')}}</v-pop>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from "vuex";
import { deepClone } from "@/libs/utils.js";

const STATUS = {
    // 开始界面
    START: 0,
    // 搜索界面
    SEARCH: 1,
    // 手动输入界面
    CUSTOM: 2,
    // 成功
    SUCCESS: 3
  },
  MAX_MESH_COUNT = 6;

export default {
  data() {
    this.STATUS = STATUS;
    return {
      confirm: {
        isAlert: true,
        show: false
      },
      success: {
        show: false
      },
      searchStatus: 0,
      sn: {
        placeholder: _("SN码"),
        maxlength: 18,
        valid: [
          {
            type: "ascii",
            args: [11, 18]
          }
        ]
      },
      add_list_data: [],
      id: 0,
      is_searching: false
    };
  },
  props: ["showSearchPop"],
  model: {
    prop: "showSearchPop",
    event: "hide"
  },
  watch: {
    showSearchPop(val) {
      if (!val) {
        this.$emit("hide", val);
        setTimeout(() => {
          this.searchStatus = STATUS.START;
        }, 500);
      }
    },
    add_list() {
      this.add_list_data.splice(0);
      this.add_list.forEach(item => {
        this.add_list_data.push({
          sortArray: [{ title: "", value: true }],
          mac: item.mac,
          sn: item.sn,
          id: this.id++
        });
      });
    }
  },
  computed: {
    ...mapState("sysinfo", ["add_list", "is_searching", "node_info"]),
    ...mapGetters("sysinfo", ["sn_to_node"]),
    paddingTop() {
      return this.add_list.length > 3
        ? 0
        : (1.7 - 0.6 * this.add_list.length) / 2;
    }
  },
  methods: {
    ...mapActions("sysinfo", ["getSearchList", "setAddNode"]),
    nextStep(step) {
      this.searchStatus = step;
    },
    search() {
      this.searchStatus = STATUS.SEARCH;
      this.is_searching = true;
      this.getSearchList().finally(() => {
        this.is_searching = false;
      });
    },
    addNodes(type) {
      let submitData = [];
      if (type === "list") {
        this.add_list_data.reduce((arr, item) => {
          if (item.val) {
            arr.push({ sn: item.sn });
          }
          return arr;
        }, submitData);

        if (submitData.length === 0) {
          this.$message(_("请选择需要添加的节点"));
          return;
        } else if (submitData.length + this.node_info.length > MAX_MESH_COUNT) {
          this.$message(_("节点数不能超过%s个", [MAX_MESH_COUNT]));
          return;
        }
      } else {
        if (this.sn.val === "") {
          this.sn.error = _("This field is required");
          return;
        }
        if (this.sn_to_node[this.sn.val]) {
          this.sn.error = _("sn对应的节点已存在");
          return;
        }
        submitData.push({
          sn: this.sn.val
        });
      }

      this.setAddNode(submitData).then(data => {
        if (data.errcode) {
          this.$message(_("sn对应的节点已存在"));
        } else {
          this.searchStatus = STATUS.SUCCESS;
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.mesh-search,
.search-box,
.add-box,
.success-box {
  min-height: 3.3rem;
  position: relative;
}

.mesh-search {
  padding-top: 0.2rem;
  img {
    height: 1rem;
  }
}

.search-wrapper {
  padding: 0 0.2rem;
}

.search-text {
  padding: 0.2rem 0 0.1rem;
}

.pop-box-toolbar {
  position: relative;
  bottom: 0;
}

.search-data {
  h4 {
    font-size: 0.16rem;
  }
}
.search-data {
  h4 {
    text-align: center;
  }
}
.mesh-icon {
  width: 0.36rem;
  margin-right: 0.1rem;

  img {
    width: 100%;
  }
}

.mesh-text {
  font-size: 0.12rem;
  line-height: 0.14rem;

  &.top-text {
    padding-top: 0.04rem;
  }
}
.mesh-item {
  position: relative;
  margin: 0 0 0.1rem;
}

.mesh-wrapper {
  min-height: 1.7rem;
  margin-top: 0.2rem;
  max-height: 2.4rem;
  overflow-y: auto;
}
.mesh-box {
  margin: auto;
}
.mesh-check {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.add-wrapper {
  padding: 0.75rem 0;
}

.search-no-data {
  text-align: center;
  padding: 0.55rem 0;
}

.img-nodata {
  width: 1rem;
}
.tip-text {
  line-height: 0.6rem;
  font-size: 0.16rem;
  color: $color-grey;
}

.icon-wrapper {
  position: absolute;
  width: 100%;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  text-align: center;
  i {
    font-size: 0.6rem;
    color: #36c626;
  }
}
</style>

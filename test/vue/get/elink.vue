<template>
  <v-form class="form-wrapper" :showSubmit="false">
    <v-group :title="title" vname="v-switch" :dataKey="dataKey"></v-group>
  </v-form>
</template>
<script>
import { mapActions, mapState } from "vuex";
export default {
  data() {
    return {
      title: "E-Link",
      dataKey: {
        values: ["1", "0"],
        events: {
          click: this.submit
        }
      }
    };
  },
  computed: {
    ...mapState(["elink_en"])
  },
  watch: {
    elink_en(val) {
      this.dataKey.val = val;
    }
  },
  methods: {
    ...mapActions(["setElink", "getElink"]),
    submit() {
      this.setElink({
        elink_en: this.dataKey.val
      });
    }
  },
  created() {
    this.getElink();
  }
};
</script>
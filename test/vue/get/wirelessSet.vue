<template>
  <v-wireless class="form-wrapper" @submit="submit" :formData="wifi" :hasLogin="false"></v-wireless>
</template>

<script>
import vWireless from "../components/v-wireless";
import { mapState, mapActions } from "vuex";

export default {
  data() {
    return {};
  },
  computed: {
    ...mapState("wireless", ["wifi"])
  },

  components: {
    vWireless
  },
  methods: {
    ...mapActions("wireless", ["getWifi", "setWifi"]),
    submit(data) {
      delete data.login_pwd;
      this.setWifi(data);
    }
  },
  created() {
    this.getWifi();
  }
};
</script>
<template>
    <div>
        <div class="form-tabs">
            <div
                class="form-tabs-item"
                v-for="tabs in dataTab"
                :key="tabs.value"
                :class="{'active': activeId == tabs.value}"
                @click="changeTabMenu(tabs.value)"
            >{{tabs.title}}</div>
        </div>
    </div>
</template>
<script>
export default {
    name: "v-tabs",
    props: ["dataTab", "callback", "tabCom"],
    data() {
        return {
            activeId: this.dataTab[0].value
        };
    },
    methods: {
        changeTabMenu(tabVal) {
            this.activeId = tabVal;
            this.callback(tabVal);
        }
    }
};
</script>
>
<style lang="scss">
.form-tabs {
    border-bottom: 1px solid $border-light-color;
    margin-bottom: 20px;
    .form-tabs-item {
        display: inline-block;
        line-height: 30px;
        height: 36px;
        padding: 0 20px;
        text-align: center;
        cursor: pointer;
        &.active {
            border-bottom: 2px solid $main-active-color;
        }
    }
}
</style>

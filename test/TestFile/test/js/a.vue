<template>
  <div
    class="time-msg"
    :style="{ top: dataMessage.top, left: dataMessage.left }"
  >
    <span>{{ dataMessage.startTime }} - {{ dataMessage.endTime }}</span>
    <div class="no-tr-help-title">
      {{ options.title }}
    </div>
  </div>
</template>
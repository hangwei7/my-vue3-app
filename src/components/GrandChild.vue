<template>
  <div style="margin-top: 8px; padding: 8px; ">
    <div>GrandChild 组件（使用 inject 接收祖先组件提供的数据）</div>
    <div style="margin-top: 4px;">孙子注入到的值: {{ shared }}</div>
  </div>
</template>

<script setup>
import { inject } from 'vue'

const shared = inject('shared', '默认值')
</script>

<style scoped>
div { 
  background-color: #161515;
  font-size: 14px; 
}
</style>
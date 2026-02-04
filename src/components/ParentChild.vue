<script setup>
import { inject, provide, ref } from 'vue'
import GrandChild from './GrandChild.vue'

provide('shared', '222')

const injectedValue = inject('shared', '默认值') // 子孙组件接收祖先组件提供的数据或方法
</script>

<template>
  <div>
    <div>Parent 组件（提供了 provide）</div>
    <div style="margin-top:8px">Child 注入到的值: {{ injectedValue }}</div>
    <GrandChild />
  </div>
</template>

<style scoped>
div { font-size: 14px }
</style>

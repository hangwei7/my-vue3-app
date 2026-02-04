<script setup>
const props = defineProps({ modelValue: { type: Number, default: 0 } })
const emit = defineEmits(['update:modelValue'])
function inc() { emit('update:modelValue', props.modelValue + 1) }
function dec() { emit('update:modelValue', props.modelValue - 1) }
</script>

<template>
  <div style="display:flex; align-items:center; gap:8px">
    <button @click="dec">-</button>
    <span>{{ modelValue }}</span>
    <button @click="inc">+</button>
  </div>
</template>

<style scoped>
button { padding:4px 8px }
</style>

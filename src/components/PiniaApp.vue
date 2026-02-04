<template>
  <div>doubleCount: {{ counter.count }}</div>
  <div>doubleCount: {{ counter.doubleCount }}</div>
  <button @click="counter.increment()">Count Plus</button>
</template>

<script setup>
import { useCounterStore } from '../stores/counter'

const counter = useCounterStore()
</script>
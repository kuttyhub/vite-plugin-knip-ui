<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import { usedHelper, usedValue, Status, DataProcessor } from './utils'

const message = usedHelper()
const value = usedValue

// Use only Active and Inactive enum members (Pending, Archived are unused)
const currentStatus = Status.Active
const defaultStatus = Status.Inactive

// Use only the add method (remove, clear, getCount are unused)
const processor = new DataProcessor()
processor.add('test item')
</script>

<template>
  <div class="app">
    <h1>Playground</h1>
    <HelloWorld :message="message" />
    <p>Value: {{ value }}</p>
    <p>Status: {{ currentStatus }} / {{ defaultStatus }}</p>
    <p>Processor: {{ processor }}</p>
    <p>Open <a href="/__knip-ui">/__knip-ui</a> to see the Knip UI panel</p>
  </div>
</template>

<style>
.app {
  font-family: system-ui, sans-serif;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

a {
  color: #42b883;
}
</style>

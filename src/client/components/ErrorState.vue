<script setup lang="ts">
import { VueButton } from '@vue/devtools-ui'

defineProps<{
  message: string
}>()

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center h-64 gap-4 text-center">
    <div class="text-4xl">⚠️</div>
    <div>
      <p class="text-lg font-medium text-red-400">Analysis Failed</p>
      <p class="text-sm opacity-60 mt-1 max-w-md">{{ message }}</p>
    </div>
    <VueButton type="primary" @click="emit('retry')"> Retry </VueButton>
  </div>
</template>

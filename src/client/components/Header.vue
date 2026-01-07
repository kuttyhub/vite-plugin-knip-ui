<script setup lang="ts">
import { VueButton, VueIcon } from '@vue/devtools-ui'

defineProps<{
  isLoading: boolean
  isConnected: boolean
}>()

const emit = defineEmits<{
  runAnalysis: []
}>()
</script>

<template>
  <header class="flex items-center justify-between p-4 border-b border-border">
    <div class="flex items-center gap-3">
      <div class="text-2xl">🔍</div>
      <div>
        <h1 class="text-lg font-semibold text-foreground">Knip UI</h1>
        <p class="text-xs opacity-60">Dead code analysis</p>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2 text-xs">
        <span
          class="w-2 h-2 rounded-full"
          :class="isConnected ? 'bg-green-500' : 'bg-red-500'"
        ></span>
        <span class="opacity-60">{{ isConnected ? 'Connected' : 'Disconnected' }}</span>
      </div>

      <VueButton type="primary" :disabled="!isConnected || isLoading" @click="emit('runAnalysis')">
        <template v-if="isLoading">
          <VueIcon icon="i-ic-baseline-refresh" class="animate-spin mr-1" />
          Analyzing...
        </template>
        <template v-else>
          <VueIcon icon="i-ic-baseline-play-arrow" class="mr-1" />
          Run Analysis
        </template>
      </VueButton>
    </div>
  </header>
</template>

<script setup lang="ts">
import { VueLoadingIndicator } from '@vue/devtools-ui'
</script>

<template>
  <div class="flex flex-col items-center justify-center h-64 gap-4">
    <VueLoadingIndicator />
    <p class="text-sm opacity-60">Running Knip analysis...</p>
  </div>
</template>

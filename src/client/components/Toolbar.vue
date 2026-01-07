<script setup lang="ts">
import { VueIcon, VueButton, VueInput } from '@vue/devtools-ui'

const search = defineModel<string>('search', { default: '' })
const isDarkTheme = defineModel<boolean>('isDarkTheme', { default: true })

defineProps<{
  isConnected: boolean
  isLoading: boolean
  totalIssues: number
}>()

const emit = defineEmits<{
  runAnalysis: []
}>()
</script>

<template>
  <header class="toolbar">
    <!-- Left: Logo + Search -->
    <div class="toolbar-section toolbar-left">
      <div class="logo">
        <VueIcon icon="i-carbon-search-locate" class="logo-icon" />
        <span class="logo-text">Knip UI</span>
      </div>

      <VueInput
        v-model="search"
        placeholder="Search..."
        left-icon="i-carbon-search"
        class="search-input"
      />
    </div>

    <!-- Center: Count -->
    <div class="toolbar-section toolbar-center">
      <div v-if="totalIssues > 0" class="total-badge">{{ totalIssues }} issues</div>
    </div>

    <!-- Right: Actions -->
    <div class="toolbar-section toolbar-right">
      <slot name="actions"></slot>

      <div class="divider"></div>

      <div class="status" :title="isConnected ? 'Connected' : 'Disconnected'">
        <span class="status-dot" :class="isConnected ? 'connected' : 'disconnected'"></span>
      </div>

      <VueButton
        type="primary"
        :disabled="!isConnected || isLoading"
        :title="isLoading ? 'Running...' : 'Run Analysis'"
        @click="emit('runAnalysis')"
      >
        <template #icon>
          <VueIcon v-if="isLoading" icon="i-carbon-renew" class="spin" />
          <VueIcon v-else icon="i-carbon-play-filled-alt" />
        </template>
      </VueButton>

      <a
        href="https://github.com/kuttyhub/vite-plugin-knip-ui"
        target="_blank"
        class="icon-btn"
        title="GitHub"
      >
        <VueIcon icon="i-carbon-logo-github" />
      </a>

      <VueButton flat @click="isDarkTheme = !isDarkTheme">
        <VueIcon v-if="isDarkTheme" icon="i-carbon-moon" />
        <VueIcon v-else icon="i-carbon-sun" />
      </VueButton>
    </div>
  </header>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--vd-c-bg-soft);
  border-bottom: 1px solid var(--vd-c-border);
  gap: 24px;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-left {
  flex: 0 0 auto;
}

.toolbar-center {
  flex: 1 1 auto;
  justify-content: center;
}

.toolbar-right {
  flex: 0 0 auto;
  gap: 8px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--vd-c-primary);
}

.logo-icon {
  font-size: 18px;
}

.logo-text {
  font-weight: 600;
  font-size: 14px;
}

.search-input {
  width: 140px;
}

.total-badge {
  padding: 5px 12px;
  background: var(--vd-c-bg);
  border: 1px solid var(--vd-c-border);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--vd-c-text-2);
}

.divider {
  width: 1px;
  height: 20px;
  background: var(--vd-c-border);
  margin: 0 4px;
}

.status {
  display: flex;
  align-items: center;
  padding: 4px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.connected {
  background: #42b883;
  box-shadow: 0 0 6px #42b88380;
}

.status-dot.disconnected {
  background: #e54545;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--vd-c-text-2);
  cursor: pointer;
  font-size: 16px;
  text-decoration: none;
  transition: all 0.15s;
}

.icon-btn:hover {
  background: var(--vd-c-bg-mute);
  color: var(--vd-c-text);
}
</style>

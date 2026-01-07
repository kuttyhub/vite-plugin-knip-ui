<script setup lang="ts">
import { VueIcon } from '@vue/devtools-ui'
import type { KnipConfigInfo } from '../../node/types'

defineProps<{
  configInfo: KnipConfigInfo | null
}>()
</script>

<template>
  <div v-if="configInfo && !configInfo.exists" class="config-banner">
    <VueIcon icon="i-carbon-warning-alt" class="banner-icon" />
    <div class="banner-content">
      <span class="banner-text">No Knip configuration detected</span>
      <a href="https://knip.dev/overview/configuration" target="_blank" class="banner-link">
        Create knip.json →
      </a>
    </div>
  </div>
  <!-- <div v-else-if="configInfo?.exists" class="config-status">
    <VueIcon icon="i-carbon-checkmark-filled" class="status-icon" />
    <span class="status-text">{{ configInfo.path }}</span>
  </div> -->
</template>

<style scoped>
.config-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(234, 179, 8, 0.15);
  border-bottom: 1px solid rgba(234, 179, 8, 0.3);
}

.banner-icon {
  color: #eab308;
  font-size: 16px;
  flex-shrink: 0;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  font-size: 12px;
}

.banner-text {
  color: var(--vd-c-text-2);
}

.banner-link {
  color: #eab308;
  text-decoration: none;
  font-weight: 500;
}

.banner-link:hover {
  text-decoration: underline;
}

.config-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  font-size: 11px;
  color: var(--vd-c-text-3);
}

.status-icon {
  color: #42b883;
  font-size: 12px;
}

.status-text {
  font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
}
</style>

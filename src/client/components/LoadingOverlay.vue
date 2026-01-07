<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import lottie, { type AnimationItem } from 'lottie-web'

const lottieContainer = ref<HTMLElement | null>(null)
let animation: AnimationItem | null = null

const LOTTIE_URL =
  'https://raw.githubusercontent.com/kuttyhub/tic-tac-toe-game/main/public/lottie/searching-floating-hand.json'

onMounted(async () => {
  if (lottieContainer.value) {
    animation = lottie.loadAnimation({
      container: lottieContainer.value,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: LOTTIE_URL,
    })
  }
})

onUnmounted(() => {
  if (animation) {
    animation.destroy()
  }
})
</script>

<template>
  <div class="loading-overlay">
    <div class="loading-content">
      <div ref="lottieContainer" class="lottie-container"></div>
      <p class="loading-text">Running Knip analysis...</p>
    </div>
  </div>
</template>

<style scoped>
.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 100;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.lottie-container {
  width: 200px;
  height: 200px;
}

.loading-text {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  opacity: 0.9;
}
</style>

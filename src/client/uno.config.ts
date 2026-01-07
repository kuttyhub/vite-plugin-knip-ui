import { defineConfig, presetIcons, type Preset } from 'unocss'
import presetWind3 from '@unocss/preset-wind3'
import { theme } from '@vue/devtools-ui/theme'

export default defineConfig({
  theme,
  // Safelist icons that are dynamically referenced (CATEGORY_ICONS, etc.)
  safelist: [
    // Category icons
    'i-carbon-document',
    'i-carbon-export',
    'i-carbon-type-pattern',
    'i-carbon-package',
    'i-carbon-tool-box',
    'i-carbon-list-dropdown',
    'i-carbon-terminal',
    'i-carbon-warning',
    'i-carbon-copy',
    'i-carbon-list-numbered',
    'i-carbon-cube',
    // Theme toggle icons
    'i-carbon-sun',
    'i-carbon-moon',
    // Export menu icons
    'i-carbon-download',
    'i-carbon-json',
    'i-carbon-table',
  ],
  presets: [
    presetWind3() as Preset,
    presetIcons({
      scale: 1.2,
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
      collections: {
        carbon: () => import('@iconify-json/carbon/icons.json').then((m) => m.default),
        ic: () => import('@iconify-json/ic/icons.json').then((m) => m.default),
        mdi: () => import('@iconify-json/mdi/icons.json').then((m) => m.default),
      },
    }),
  ],
  shortcuts: {
    '$ui-fcc': 'flex justify-center items-center',
    '$ui-fbc': 'flex justify-between items-center',
    '$ui-fsc': 'flex justify-start items-center',
    '$ui-if-sc': 'inline-flex justify-start items-center',
    '$ui-fec': 'flex justify-end items-center',
    '$ui-inline-fcc': 'inline-flex justify-center items-center',
    '$ui-z-max': 'z-2147483646',
    '$ui-z-max-override': 'z-2147483647',
    '$ui-bg-base': 'bg-white dark:bg-#121212',
    '$ui-base': 'box-border font-inherit',
    '$ui-transition': 'transition-all duration-300 ease-in-out',
    '$ui-borderless': '!border-transparent !shadow-none',
    '$ui-base-br': 'rounded-3px',
    '$ui-border-base': 'border-gray/20',
    '$ui-text': 'text-black dark:text-#dfe0e2',
    '$ui-glass-effect': 'backdrop-blur-6 bg-white/80 dark:bg-#3C3C3C/90',
  },
})

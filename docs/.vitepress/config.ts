import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Vite Plugin Knip UI',
  description: 'Visualize Knip dead code analysis in your Vite dev server',
  base: '/vite-plugin-knip-ui/',

  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/vite-plugin-knip-ui/logo.svg' }]],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Reference', link: '/reference/plugin-options' },
      {
        text: 'Links',
        items: [
          { text: 'Knip', link: 'https://knip.dev' },
          { text: 'Vite', link: 'https://vitejs.dev' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'CI/CD Integration', link: '/guide/ci-cd' },
            { text: 'Troubleshooting', link: '/guide/troubleshooting' },
          ],
        },
      ],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'Plugin Options', link: '/reference/plugin-options' },
            { text: 'Knip Configuration', link: '/reference/knip-config' },
            { text: 'Issue Types', link: '/reference/issue-types' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/kuttyhub/vite-plugin-knip-ui' }],

    editLink: {
      pattern: 'https://github.com/kuttyhub/vite-plugin-knip-ui/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 Nishanth S',
    },

    search: {
      provider: 'local',
    },
  },
})

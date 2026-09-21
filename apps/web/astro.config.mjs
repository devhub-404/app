import { defineConfig, envField } from 'astro/config';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { rehypeShiki, unified } from '@astrojs/markdown-remark';
import cloudflare from '@astrojs/cloudflare';
import solid from '@astrojs/solid-js';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://devhub404.org',
  output: 'server',
  adapter: cloudflare(),
  compressHTML: true,
  markdown: {
    processor: unified({
      rehypePlugins: [[rehypeShiki, { theme: 'github-dark' }]]
    })
  },
  integrations: [
    solid(),
    icon({
      include: {
        lucide: ['*']
      }
    })
  ],
  env: {
    schema: {
      APP_ENV: envField.string({ context: 'client', access: 'public' }),
      API_URL: envField.string({ context: 'client', access: 'public' }),
      PUBLIC_GITHUB_REPO_NAME: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_GITHUB_REPO_OWNER: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_GITHUB_SPONSOR_URL: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_DISCORD_URL: envField.string({ context: 'client', access: 'public', optional: true })
    }
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ['solid-js'],
      alias: {
        '@': resolve(fileURLToPath(new URL('.', import.meta.url)), 'src'),
        '@devhub-404/api-contract': resolve(fileURLToPath(new URL('.', import.meta.url)), '../../packages/api-contract/src')
      }
    },
    ssr: {
      optimizeDeps: {
        include: ['astro-icon/components'],
        exclude: ['@modular-forms/solid']
      }
    }
  }
});

import {
  APP_ENV,
  API_URL,
  PUBLIC_GITHUB_REPO_NAME,
  PUBLIC_GITHUB_REPO_OWNER,
  PUBLIC_GITHUB_SPONSOR_URL,
  PUBLIC_DISCORD_URL,
} from 'astro:env/client';

const repoOwner = (PUBLIC_GITHUB_REPO_OWNER ?? 'devhub')
  .replace(/^https?:\/\/(?:www\.)?github\.com\//, '')
  .split('/')[0];
const repoName = PUBLIC_GITHUB_REPO_NAME ?? 'devhub';

export const env = {
  isDev: APP_ENV === 'development',
  apiUrl: API_URL,
  github: {
    configured: Boolean(PUBLIC_GITHUB_REPO_OWNER && PUBLIC_GITHUB_REPO_NAME),
    repoOwner,
    repoName,
    sponsorUrl: PUBLIC_GITHUB_SPONSOR_URL ?? `https://github.com/sponsors/${repoOwner}`,
    repoUrl: `https://github.com/${repoOwner}/${repoName}`,
  },
  discordUrl: PUBLIC_DISCORD_URL ?? 'https://discord.gg/EUQ9MvucXD',
} as const;

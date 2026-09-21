// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import stylistic from '@stylistic/eslint-plugin';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist', 'coverage', 'worker-configuration.d.ts'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: globals.node,
      sourceType: 'module',
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      'unused-imports': unusedImports,
      '@stylistic': stylistic,
    },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      // Existing adapters contain intentional compatibility assertions.
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-floating-promises': 'warn',
      // Formatting is checked independently by the format:check script.
      'prettier/prettier': 'off',
      '@stylistic/padding-line-between-statements': [
        'error',
        {
          blankLine: 'any',
          prev: ['const', 'let', 'var'],
          next: ['const', 'let', 'var'],
        },
        {
          blankLine: 'always',
          prev: ['const', 'let', 'var'],
          next: ['function', 'class'],
        },
        {
          blankLine: 'always',
          prev: ['function', 'class'],
          next: ['const', 'let', 'var'],
        },
        {
          blankLine: 'always',
          prev: 'function',
          next: 'class',
        },
        {
          blankLine: 'always',
          prev: 'class',
          next: 'function',
        },
        {
          blankLine: 'always',
          prev: '*',
          next: ['return', 'throw'],
        },
      ],
    },
  },
  {
    files: ['tests/**/*.ts'],
    rules: {
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['src/**/*.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'process',
          property: 'env',
          message: 'Use the application environment module instead of process.env.',
        },
      ],
    },
  },
  {
    files: ['src/app/config/env.ts', 'src/app/config/env-file.ts'],
    rules: {
      'no-restricted-properties': 'off',
    },
  },
);

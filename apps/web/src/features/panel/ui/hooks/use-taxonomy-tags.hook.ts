import { debounce } from '@utilify/core';
import { onCleanup, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import {
  createTag,
  createTagAlias,
  deleteTag,
  deleteTagAlias,
  deleteTagIdentityTerm,
  listTagAliases,
  listTagIdentityTerms,
  listTagsPage,
  mergeTags,
  setTagIdentityTerm,
  updateTag,
  type TagAliasDTO,
  type TagDTO,
  type TagIdentityTermDTO,
} from '@/shared/taxonomy/public';
import { useI18n } from '@/features/panel/i18n';
import { canAccessPanelCapability } from '@/features/panel/access/panel.access.ts';

const PAGE_SIZE = 25;
const hasApiError = (result: object) => 'error' in result && Boolean(result.error);

export function useTaxonomyTags(role: string | null | undefined) {
  const canManageTags = canAccessPanelCapability(role, 'tags');
  const canManageAliases = canAccessPanelCapability(role, 'aliases');
  const canManageGovernance = canAccessPanelCapability(role, 'governance');
  const { t } = useI18n();
  const [state, setState] = createStore({
    items: [] as TagDTO[],
    aliases: [] as TagAliasDTO[],
    terms: [] as TagIdentityTermDTO[],
    loading: true,
    busy: false,
    message: '',
    query: '',
    page: 1,
    total: 0,
  });
  let requestVersion = 0;

  const loadTags = async (nextPage = state.page, nextQuery = state.query) => {
    if (!canManageTags) return;
    const version = ++requestVersion;
    setState('loading', true);
    try {
      const result = await listTagsPage({
        search: nextQuery.trim() || undefined,
        page: nextPage,
        pageSize: PAGE_SIZE,
      });
      if (version !== requestVersion) return;
      if (hasApiError(result)) {
        setState('items', []);
        setState('page', nextPage);
        setState('total', 0);
        setState('message', t('taxonomytags.loadFailed'));
        return;
      }
      const data = result.data?.data;
      setState('items', data?.items ?? []);
      setState('page', data?.page ?? nextPage);
      setState('total', data?.total ?? 0);
      setState('message', '');
    } finally {
      if (version === requestVersion) setState('loading', false);
    }
  };

  const requestSearch = debounce((value: string) => void loadTags(1, value), 400);

  const reload = async () => {
    setState('loading', true);
    try {
      const [tags, aliasResult, termResult] = await Promise.all([
        canManageTags
          ? listTagsPage({ search: state.query.trim() || undefined, page: state.page, pageSize: PAGE_SIZE })
          : Promise.resolve(null),
        canManageAliases ? listTagAliases() : Promise.resolve(null),
        canManageGovernance ? listTagIdentityTerms() : Promise.resolve(null),
      ]);
      const data = tags?.data?.data;
      setState('items', data?.items ?? []);
      setState('page', data?.page ?? state.page);
      setState('total', data?.total ?? 0);
      setState('aliases', aliasResult?.data?.data ?? []);
      setState('terms', termResult?.data?.data ?? []);
      if (
        (tags !== null && hasApiError(tags)) ||
        (aliasResult !== null && hasApiError(aliasResult)) ||
        (termResult !== null && hasApiError(termResult))
      ) {
        setState('message', t('taxonomytags.loadFailed'));
      }
    } finally {
      setState('loading', false);
    }
  };

  onMount(() => void reload());
  onCleanup(requestSearch.cancel);

  const run = async (allowed: boolean, operation: () => Promise<boolean>, success: string, refreshTags = false) => {
    if (!allowed || state.busy) return false;
    setState('busy', true);
    setState('message', '');
    try {
      const result = await operation();
      if (result) {
        setState('message', success);
        if (refreshTags) await loadTags();
      } else {
        setState('message', t('taxonomytags.changeFailedReviewDataTryAgain'));
      }
      return result;
    } finally {
      setState('busy', false);
    }
  };

  return {
    canManageTags,
    canManageAliases,
    canManageGovernance,
    items: () => state.items,
    aliases: () => state.aliases,
    terms: () => state.terms,
    loading: () => state.loading,
    busy: () => state.busy,
    message: () => state.message,
    query: () => state.query,
    page: () => state.page,
    total: () => state.total,
    pageSize: PAGE_SIZE,
    setQuery: (value: string) => {
      setState('query', value);
      requestSearch(value);
    },
    setPage: (value: number) => void loadTags(value),
    reload,
    createTag: (name: string, slug: string) =>
      run(
        canManageTags,
        () => createTag({ name: name.trim() || slug.trim().toLowerCase(), slug: slug.trim().toLowerCase() }),
        t('taxonomytags.tagCreated'),
        true,
      ),
    updateTag: (id: string, name: string, slug: string) =>
      run(
        canManageTags,
        () => updateTag(id, { name: name.trim(), slug: slug.trim() }),
        t('taxonomytags.tagUpdated'),
        true,
      ),
    deleteTag: (id: string) => run(canManageTags, () => deleteTag(id), t('taxonomytags.tagRemoved'), true),
    mergeTags: (sourceTagId: string, targetTagId: string) =>
      run(canManageTags, () => mergeTags({ sourceTagId, targetTagId }), t('taxonomytags.tagsMerged'), true),
    addAlias: async (tagId: string, alias: string) => {
      const result = await run(
        canManageAliases,
        () => createTagAlias({ tagId, alias: alias.trim() }),
        t('taxonomytags.aliasAdded'),
      );
      if (result) {
        const refreshed = await listTagAliases();
        setState('aliases', refreshed.data?.data ?? []);
      }
      return result;
    },
    removeAlias: async (id: string) => {
      const result = await run(canManageAliases, () => deleteTagAlias(id), t('taxonomytags.aliasRemoved'));
      if (result) setState('aliases', (current) => current.filter((alias) => alias.id !== id));
      return result;
    },
    addProtectedTerm: async (value: string, kind: 'reserved' | 'blocked') => {
      const result = await run(
        canManageGovernance,
        () => setTagIdentityTerm({ value: value.trim(), kind }),
        t('taxonomytags.termProtected'),
      );
      if (result) {
        const refreshed = await listTagIdentityTerms();
        setState('terms', refreshed.data?.data ?? []);
      }
      return result;
    },
    removeProtectedTerm: async (id: string) => {
      const result = await run(canManageGovernance, () => deleteTagIdentityTerm(id), t('taxonomytags.termRemoved'));
      if (result) setState('terms', (current) => current.filter((term) => term.id !== id));
      return result;
    },
  };
}

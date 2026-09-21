export { default as FollowedTagsPage } from '../ui/pages/followed-tags.page.astro';
export { followTag, unfollowTag, listFollowedTags } from '../actions/follow.action.ts';
export type { FollowedTag } from '../types/follow.type.ts';

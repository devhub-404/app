import { Avatar } from '@ark-ui/solid';

type Props = {
  src?: string | null;
  name?: string | null;
  fallback?: string;
  alt: string;
  class?: string;
};

function initials(name: string | null | undefined) {
  const words = (name ?? '').trim().replace(/^@+/, '').split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export default function UserAvatar(props: Props) {
  const fallback = () => props.fallback?.trim() || initials(props.name);

  return (
    <Avatar.Root
      class={
        props.class ??
        'grid size-10 place-items-center overflow-hidden rounded-full bg-action-muted text-xs font-extrabold text-content'
      }
    >
      <Avatar.Image
        src={props.src ?? undefined}
        alt={props.alt}
        class="h-full w-full object-cover"
        loading="eager"
        referrerpolicy="no-referrer"
      />
      <Avatar.Fallback class="grid h-full w-full place-items-center">{fallback()}</Avatar.Fallback>
    </Avatar.Root>
  );
}

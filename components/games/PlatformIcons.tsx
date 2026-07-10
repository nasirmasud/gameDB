import { getPlatformIcon } from "@/lib/platform-icons";
import type { RawgGameSummary } from "@/lib/rawg";

interface PlatformIconsProps {
  platforms: RawgGameSummary["platforms"];
}

export function PlatformIcons({ platforms }: PlatformIconsProps) {
  if (!platforms?.length) return null;

  // Dedupe: RAWG lists "playstation4" and "playstation5" separately,
  // but we only want one PlayStation icon in the row.
  const seen = new Set<string>();
  const unique = platforms.filter(({ platform }) => {
    const icon = getPlatformIcon(platform.slug);
    const key = icon.name; // component function name as uniqueness key
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <div className='flex items-center gap-2'>
      {unique.map(({ platform }) => {
        const Icon = getPlatformIcon(platform.slug);
        return (
          <Icon
            key={platform.id}
            className='h-3.5 w-3.5 text-muted-foreground'
            title={platform.name}
          />
        );
      })}
    </div>
  );
}

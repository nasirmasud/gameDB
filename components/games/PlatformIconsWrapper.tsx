"use client";

import { PlatformIcons } from "./PlatformIcons";

interface Props {
  platforms: Array<{ platform: { id: number; name: string; slug: string } }>;
}

export function PlatformIconsWrapper({ platforms }: Props) {
  return <PlatformIcons platforms={platforms} />;
}

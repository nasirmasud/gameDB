import { IconType } from "react-icons";
import { BsGlobe, BsNintendoSwitch } from "react-icons/bs";
import {
  FaAndroid,
  FaApple,
  FaLinux,
  FaPlaystation,
  FaWindows,
  FaXbox,
} from "react-icons/fa";
import { MdPhoneIphone } from "react-icons/md";

/**
 * RAWG platform slugs look like "playstation5", "xbox-series-x",
 * "nintendo-switch", "macos", "ios" etc — not exact single words —
 * so we match by substring instead of exact key lookup.
 */
export function getPlatformIcon(slug: string): IconType {
  const s = slug.toLowerCase();

  if (s.includes("playstation")) return FaPlaystation;
  if (s.includes("xbox")) return FaXbox;
  if (s.includes("nintendo")) return BsNintendoSwitch;
  if (s.includes("mac")) return FaApple;
  if (s.includes("linux")) return FaLinux;
  if (s.includes("ios")) return MdPhoneIphone;
  if (s.includes("android")) return FaAndroid;
  if (s.includes("pc")) return FaWindows;

  return BsGlobe; // web / unknown platform fallback
}

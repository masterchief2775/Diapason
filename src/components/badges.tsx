import { Compass, Disc3, Drum, Ear, Flame, Guitar, Hammer, Medal, Music2, PenLine, Sparkles, Sprout, Star, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BadgeIcon } from "@/lib/gamification";

const ICONS: Record<BadgeIcon, typeof Star> = {
  sprout: Sprout,
  hammer: Hammer,
  music: Music2,
  sparkles: Sparkles,
  ear: Ear,
  pen: PenLine,
  flame: Flame,
  zap: Zap,
  trophy: Trophy,
  star: Star,
  disc: Disc3,
  compass: Compass,
  guitar: Guitar,
  drum: Drum,
  medal: Medal,
};

/** Médaillon de badge : logo lucide sur fond teinté, grisé si verrouillé. */
export function BadgeMedal({
  icon,
  accent,
  locked,
  size = 40,
}: {
  icon: BadgeIcon;
  accent: string;
  locked?: boolean;
  size?: number;
}) {
  const Icon = ICONS[icon] ?? Star;
  return (
    <span
      aria-hidden
      className={cn("grid shrink-0 place-items-center rounded-full border")}
      style={{
        width: size,
        height: size,
        borderColor: locked ? "var(--line)" : accent,
        background: locked ? "var(--raised)" : `color-mix(in srgb, ${accent} 18%, transparent)`,
        color: locked ? "var(--subtle)" : accent,
        boxShadow: locked ? "none" : `0 0 12px color-mix(in srgb, ${accent} 35%, transparent)`,
      }}
    >
      <Icon size={Math.round(size * 0.5)} />
    </span>
  );
}

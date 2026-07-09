"use client";

import { useT } from "@/lib/LangContext";

const TAG_STYLES: Record<string, { emoji: string; tone: string }> = {
  ldl_good: { emoji: "🫀", tone: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300" },
  ldl_bad: { emoji: "🫀", tone: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300" },
  ldl_neutral: { emoji: "🫀", tone: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300" },
  sugar_good: { emoji: "🩸", tone: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300" },
  sugar_bad: { emoji: "🩸", tone: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300" },
  sugar_neutral: { emoji: "🩸", tone: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300" },
  sodium_good: { emoji: "💚", tone: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300" },
  sodium_bad: { emoji: "❤️", tone: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300" },
  sodium_neutral: { emoji: "💛", tone: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300" },
};

const PREFIX_ORDER = ["ldl", "sugar", "sodium"] as const;

function pickTags(tags?: string | null): string[] {
  if (!tags) return [];
  const list = tags.split(",").filter(Boolean);
  const picked: string[] = [];
  for (const prefix of PREFIX_ORDER) {
    const found = list.find((t) => t.startsWith(prefix + "_"));
    if (found) picked.push(found);
  }
  return picked;
}

export function HealthTagBadges({
  tags,
  size = "sm",
  showDisclaimer = false,
}: {
  tags?: string | null;
  size?: "xs" | "sm";
  showDisclaimer?: boolean;
}) {
  const { t } = useT();
  const picked = pickTags(tags);
  if (picked.length === 0) return null;

  const textSize = size === "xs" ? "text-[9px] px-1 py-0" : "text-[10px] px-1.5 py-0.5";

  return (
    <span className="inline-flex flex-wrap items-center gap-0.5" title={t.health.disclaimer}>
      {picked.map((tag) => {
        const style = TAG_STYLES[tag] || {
          emoji: "•",
          tone: "bg-gray-100 dark:bg-gray-700 text-gray-600",
        };
        const label =
          (t.health as Record<string, string>)[tag] || tag.replace(/_/g, " ");
        return (
          <span
            key={tag}
            className={`${textSize} rounded-full font-medium inline-flex items-center gap-0.5 ${style.tone}`}
          >
            <span aria-hidden>{style.emoji}</span>
            {label}
          </span>
        );
      })}
      {showDisclaimer && (
        <span className="sr-only">{t.health.disclaimer}</span>
      )}
    </span>
  );
}

import Link from "next/link";
import { ArrowUpRightIcon, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  hint,
  index = 0,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  href?: string;
  hint?: string;
  index?: number;
}) {
  const valueIsLong = String(value).length > 7;

  const inner = (
    <>
      <div
        className="pointer-events-none absolute -top-10 -right-10 size-32 rounded-full bg-primary/5 blur-2xl transition-colors group-hover:bg-primary/10"
        aria-hidden
      />
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        {href && (
          <ArrowUpRightIcon className="size-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
        )}
      </div>
      <div className="mt-5">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p
          className={cn(
            "mt-1 font-mono font-semibold tracking-tight tabular-nums text-foreground",
            valueIsLong ? "text-2xl" : "text-4xl",
          )}
        >
          {value}
        </p>
        {hint && (
          <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
    </>
  );

  const className = cn(
    "group animate-in fade-in slide-in-from-bottom-3 fill-mode-both relative flex flex-col overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10 transition-shadow",
    href && "hover:shadow-lg hover:shadow-foreground/5",
  );
  const style = {
    animationDelay: `${index * 70}ms`,
    animationDuration: "450ms",
  } as React.CSSProperties;

  if (href) {
    return (
      <Link href={href} className={className} style={style}>
        {inner}
      </Link>
    );
  }
  return (
    <div className={className} style={style}>
      {inner}
    </div>
  );
}

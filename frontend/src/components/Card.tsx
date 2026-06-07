import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  as?: "section" | "article" | "div";
  ariaLabelledBy?: string;
}

export function Card({
  children,
  className = "",
  as: Tag = "section",
  ariaLabelledBy,
}: CardProps): JSX.Element {
  return (
    <Tag
      aria-labelledby={ariaLabelledBy}
      className={[
        "rounded-3xl border-2 border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-soft",
        className,
      ]
        .join(" ")
        .trim()}
    >
      {children}
    </Tag>
  );
}

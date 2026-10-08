/** Shared scene palette; CSS uses the same three anchors. */
export const PALETTE = {
  paper: "#f5f6f8",
  ink: "#17191f",
  rust: "#2547d0",
} as const;

/** Composite an anchor over paper; equivalent to an opacity-derived UI tone. */
export function tone(color: string, opacity: number): string {
  const foreground = color.slice(1).match(/.{2}/g)!;
  const background = PALETTE.paper.slice(1).match(/.{2}/g)!;
  return (
    "#" +
    foreground
      .map((channel, i) =>
        Math.round(
          parseInt(channel, 16) * opacity +
            parseInt(background[i], 16) * (1 - opacity),
        )
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

export const ROUTE_COLORS = {
  baseline: PALETTE.ink,
  failure: PALETTE.rust,
  repaired: PALETTE.ink,
} as const;

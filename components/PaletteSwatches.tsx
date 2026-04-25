import { cn } from "@/lib/utils";

export function PaletteSwatches({
  palette,
  size = "md",
  className,
}: {
  palette: string[];
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dimension =
    size === "sm" ? "h-3 w-3" : size === "lg" ? "h-7 w-7" : "h-5 w-5";

  return (
    <div className={cn("flex -space-x-1.5", className)}>
      {palette.slice(0, 5).map((color, i) => (
        <span
          key={`${color}-${i}`}
          className={cn(
            "inline-block rounded-full border border-white/80 shadow-ring",
            dimension,
          )}
          style={{ backgroundColor: color }}
          title={color}
          aria-label={`Color ${color}`}
        />
      ))}
    </div>
  );
}

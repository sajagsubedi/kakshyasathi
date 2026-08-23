import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentProps<"div"> {
  value?: number;
  max?: number;
}

function Progress({
  value = 0,
  max = 100,
  className,
  ...props
}: ProgressProps) {
  const safeValue = Math.max(0, Math.min(max, value));
  const percentage = max > 0 ? (safeValue / max) * 100 : 0;

  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={safeValue}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className="h-full w-full flex-1 bg-primary transition-all duration-300 ease-out"
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  );
}

export { Progress };

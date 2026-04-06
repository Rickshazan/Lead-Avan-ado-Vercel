import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type SpinnerProps = {
  size?: "sm" | "md";
  className?: string;
};

const spinnerSizes = {
  sm: "h-4 w-4",
  md: "h-5 w-5"
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return <LoaderCircle className={cn("animate-spin text-current", spinnerSizes[size], className)} />;
}

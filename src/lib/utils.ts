import { clsx, type ClassValue } from "clsx";
// @ts-expect-error - tailwind-merge might not have declaration files in some environments
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

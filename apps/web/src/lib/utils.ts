import type { ClassValue } from "clsx"
import type { Ref } from "vue"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function valueUpdater<T>(updaterOrValue: T | ((prev: T) => T), ref: Ref<T>) {
  ref.value
    = typeof updaterOrValue === "function"
      ? (updaterOrValue as (prev: T) => T)(ref.value)
      : updaterOrValue
}

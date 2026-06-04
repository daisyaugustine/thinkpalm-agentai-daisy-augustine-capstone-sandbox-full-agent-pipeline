import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toPascalCase(title: string, index: number): string {
  const cleaned = title.replace(/[^a-zA-Z0-9]+/g, " ").trim();
  const pascal = cleaned
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
  return pascal.length ? pascal : `Widget${index + 1}`;
}

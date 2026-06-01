type ClassValue = string | number | boolean | undefined | null | ClassValue[] | { [key: string]: boolean | undefined | null };

export function cn(...inputs: ClassValue[]): string {
  return inputs
    .flat()
    .filter((x) => typeof x === "string" && x.length > 0)
    .join(" ");
}
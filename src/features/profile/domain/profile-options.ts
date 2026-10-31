import type { ExperienceLevel, TechStack } from '@/core/types/api';

export const MAX_PRIMARY_STACK = 5;

interface ChipOption<T extends string> {
  value: T;
  label: string;
}

export const experienceLevelOptions = [
  { value: 'JUNIOR', label: 'Júnior' },
  { value: 'PLENO', label: 'Pleno' },
  { value: 'SENIOR', label: 'Sênior' },
  { value: 'ESPECIALISTA', label: 'Especialista' },
] as const satisfies readonly ChipOption<ExperienceLevel>[];

export const techStackOptions = [
  { value: 'JAVA', label: 'Java' },
  { value: 'KOTLIN', label: 'Kotlin' },
  { value: 'JAVASCRIPT', label: 'JavaScript' },
  { value: 'TYPESCRIPT', label: 'TypeScript' },
  { value: 'PYTHON', label: 'Python' },
  { value: 'GO', label: 'Go' },
  { value: 'CSHARP', label: 'C#' },
  { value: 'PHP', label: 'PHP' },
  { value: 'RUBY', label: 'Ruby' },
  { value: 'RUST', label: 'Rust' },
  { value: 'SWIFT', label: 'Swift' },
  { value: 'REACT', label: 'React' },
  { value: 'NODE', label: 'Node.js' },
  { value: 'SPRING', label: 'Spring' },
  { value: 'DOTNET', label: '.NET' },
  { value: 'SQL', label: 'SQL' },
  { value: 'DOCKER', label: 'Docker' },
  { value: 'AWS', label: 'AWS' },
] as const satisfies readonly ChipOption<TechStack>[];

export const experienceLevelCodes = experienceLevelOptions.map((option) => option.value) as [
  ExperienceLevel,
  ...ExperienceLevel[],
];

export const techStackCodes = techStackOptions.map((option) => option.value) as [
  TechStack,
  ...TechStack[],
];

export function experienceLevelLabel(level?: ExperienceLevel | null): string | null {
  if (!level) return null;
  return experienceLevelOptions.find((option) => option.value === level)?.label ?? null;
}

export function techStackLabel(code: TechStack): string {
  return techStackOptions.find((option) => option.value === code)?.label ?? code;
}

/** Empty is allowed; anything else must be an absolute http(s) URL. */
export function isValidWebsiteUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  return safeExternalUrl(trimmed) !== null;
}

/** Returns a navigable http(s) URL or null, so stored legacy values cannot inject a scheme. */
export function safeExternalUrl(value?: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

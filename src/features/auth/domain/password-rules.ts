export interface PasswordRule {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

export const passwordRules: PasswordRule[] = [
  { id: 'length', label: '10 ou mais caracteres', test: (value) => value.length >= 10 },
  { id: 'upper', label: 'Uma letra maiúscula', test: (value) => /[A-Z]/.test(value) },
  { id: 'lower', label: 'Uma letra minúscula', test: (value) => /[a-z]/.test(value) },
  { id: 'number', label: 'Um número', test: (value) => /\d/.test(value) },
  { id: 'special', label: 'Um caractere especial', test: (value) => /[^A-Za-z0-9]/.test(value) },
];

export function passwordScore(value: string): number {
  return passwordRules.filter((rule) => rule.test(value)).length;
}

export function passwordStrengthLabel(score: number): { label: string; tone: 'rose' | 'amber' | 'volt' } {
  if (score <= 2) return { label: 'Fraca', tone: 'rose' };
  if (score <= 4) return { label: 'Quase lá', tone: 'amber' };
  return { label: 'Forte', tone: 'volt' };
}

import { describe, expect, it } from 'vitest';
import { passwordRules, passwordScore, passwordStrengthLabel } from './password-rules';

describe('password policy mirror', () => {
  it('counts classes independently of the length rule', () => {
    expect(passwordScore('Aa1!')).toBe(4);
    expect(passwordRules.find((rule) => rule.id === 'length')?.test('Aa1!')).toBe(false);
  });

  it('accepts a strong password with every required class', () => {
    expect(passwordScore('Senha@12345')).toBe(5);
    expect(passwordStrengthLabel(5)).toEqual({ label: 'Forte', tone: 'volt' });
  });

  it('flags weak and intermediate scores', () => {
    expect(passwordStrengthLabel(2).tone).toBe('rose');
    expect(passwordStrengthLabel(4).tone).toBe('amber');
  });

  it('checks each backend rule independently', () => {
    const byId = Object.fromEntries(passwordRules.map((rule) => [rule.id, rule.test]));
    expect(byId.length?.('1234567890')).toBe(true);
    expect(byId.upper?.('abc')).toBe(false);
    expect(byId.lower?.('ABC')).toBe(false);
    expect(byId.number?.('abc')).toBe(false);
    expect(byId.special?.('abc')).toBe(false);
    expect(byId.special?.('abc!')).toBe(true);
  });
});

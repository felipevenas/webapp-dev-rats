import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(10, 'Use pelo menos 10 caracteres')
  .max(128, 'Use no máximo 128 caracteres')
  .regex(/[A-Z]/, 'Inclua uma letra maiúscula')
  .regex(/[a-z]/, 'Inclua uma letra minúscula')
  .regex(/\d/, 'Inclua um número')
  .regex(/[^A-Za-z0-9]/, 'Inclua um caractere especial');

export const loginSchema = z.object({
  email: z.email('Informe um e-mail válido'),
  password: z.string().min(1, 'Informe sua senha'),
});

export const registerSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Informe pelo menos 2 caracteres')
    .max(120, 'Use no máximo 120 caracteres'),
  username: z
    .string()
    .trim()
    .min(3, 'Use pelo menos 3 caracteres')
    .max(30, 'Use no máximo 30 caracteres')
    .regex(/^[a-z0-9_]+$/, 'Use apenas letras minúsculas, números e _'),
  email: z.email('Informe um e-mail válido'),
  password: passwordSchema,
  timezone: z.string().min(1, 'Selecione seu fuso horário'),
  acceptTerms: z.boolean().refine((value) => value, 'Aceite os termos para continuar'),
});

export const forgotPasswordSchema = z.object({
  email: z.email('Informe um e-mail válido'),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem',
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

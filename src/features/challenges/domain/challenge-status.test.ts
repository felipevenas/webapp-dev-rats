import { describe, expect, it } from 'vitest';
import {
  verificationModeCopy,
  verificationModeRequiresGitHub,
  verificationModeTone,
} from './challenge-status';

describe('verificationModeCopy', () => {
  it('describes the study photo mode', () => {
    expect(verificationModeCopy('STUDY_PHOTO')).toEqual({
      label: 'Foto de estudo',
      short: 'Foto',
      description: 'Cada dia válido vem de uma foto de estudo publicada no grupo.',
    });
  });

  it('does not require GitHub for the study photo mode', () => {
    expect(verificationModeRequiresGitHub('STUDY_PHOTO')).toBe(false);
    expect(verificationModeRequiresGitHub('OWN_REPOSITORIES')).toBe(true);
    expect(verificationModeRequiresGitHub('SELECTED_REPOSITORIES')).toBe(true);
  });

  it('uses the amber tone for the study photo mode', () => {
    expect(verificationModeTone('STUDY_PHOTO')).toBe('amber');
  });
});

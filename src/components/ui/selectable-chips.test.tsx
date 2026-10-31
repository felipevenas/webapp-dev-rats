// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import type { TechStack } from '@/core/types/api';
import { techStackOptions } from '@/features/profile/domain/profile-options';
import { SelectableChips } from './selectable-chips';

function Harness({ max = 2 }: { max?: number }) {
  const [selected, setSelected] = useState<TechStack[]>(['JAVA']);
  return (
    <SelectableChips
      ariaLabel="Stack principal"
      options={techStackOptions}
      selected={selected}
      onChange={setSelected}
      max={max}
    />
  );
}

describe('SelectableChips', () => {
  it('exposes the group and the selection state to assistive technology', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    expect(screen.getByRole('group', { name: 'Stack principal' })).toBeInTheDocument();

    const java = screen.getByRole('button', { name: 'Java' });
    const kotlin = screen.getByRole('button', { name: 'Kotlin' });
    expect(java).toHaveAttribute('aria-pressed', 'true');
    expect(kotlin).toHaveAttribute('aria-pressed', 'false');

    await user.click(kotlin);
    expect(kotlin).toHaveAttribute('aria-pressed', 'true');
  });

  it('disables unselected chips after reaching the limit and re-enables them when freeing a slot', async () => {
    const user = userEvent.setup();
    render(<Harness max={2} />);

    const java = screen.getByRole('button', { name: 'Java' });
    const kotlin = screen.getByRole('button', { name: 'Kotlin' });
    const react = screen.getByRole('button', { name: 'React' });

    await user.click(kotlin);
    expect(react).toBeDisabled();

    await user.click(java);
    expect(java).toHaveAttribute('aria-pressed', 'false');
    expect(react).toBeEnabled();
  });
});

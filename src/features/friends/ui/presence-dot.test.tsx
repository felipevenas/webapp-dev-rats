// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PresenceDot } from './presence-dot';

describe('PresenceDot', () => {
  it('renders nothing when presence is missing or null', () => {
    const { container: missing } = render(<PresenceDot />);
    expect(missing).toBeEmptyDOMElement();

    const { container: withNull } = render(<PresenceDot presence={null} />);
    expect(withNull).toBeEmptyDOMElement();
  });

  it('exposes an accessible label for each presence state', () => {
    const { rerender } = render(<PresenceDot presence="ONLINE" />);
    expect(screen.getByRole('img', { name: 'Online agora' })).toBeInTheDocument();

    rerender(<PresenceDot presence="AWAY" />);
    expect(screen.getByRole('img', { name: 'Ausente' })).toBeInTheDocument();

    rerender(<PresenceDot presence="OFFLINE" />);
    expect(screen.getByRole('img', { name: 'Offline' })).toBeInTheDocument();
  });

  it('does not rely on colour alone when withLabel is enabled', () => {
    render(<PresenceDot presence="ONLINE" withLabel />);
    expect(screen.getByRole('img', { name: 'Online agora' })).toBeInTheDocument();
    expect(screen.getByText('Online agora')).toBeInTheDocument();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import App from '../App';

// jsdom can't compute colours; contrast is covered by scripts/contrast.mjs and axe-audit.mjs.
const run = (node) => axe(node, { rules: { 'color-contrast': { enabled: false } } });

const go = async (hash) => act(async () => {
  window.location.hash = hash;
  window.dispatchEvent(new HashChangeEvent('hashchange'));
});

describe('axe-core automated audit (WCAG 2.1 A/AA rules)', () => {
  it.each([
    ['home', '#/'],
    ['catalogue', '#/catalogue'],
    ['resource detail', '#/resource/wc-history'],
    ['book a room', '#/book'],
  ])('%s view has no violations', async (_n, hash) => {
    const { container } = render(<App availabilityDelay={0} />);
    await go(hash);
    expect(await run(container)).toHaveNoViolations();
  });

  it('booking form error state has no violations', async () => {
    const user = userEvent.setup();
    const { container } = render(<App availabilityDelay={0} />);
    await go('#/book');
    await user.click(screen.getByRole('button', { name: 'Request booking' }));
    expect(await run(container)).toHaveNoViolations();
  });

  it('catalogue with all filter panels expanded has no violations', async () => {
    const user = userEvent.setup();
    const { container } = render(<App availabilityDelay={0} />);
    await go('#/catalogue');
    await user.click(screen.getByRole('button', { name: /^Topic/ }));
    await user.click(screen.getByRole('button', { name: /^Format/ }));
    await user.click(screen.getByRole('button', { name: 'Languages' }));
    expect(await run(container)).toHaveNoViolations();
  });

  it('open dialog has no violations', async () => {
    const user = userEvent.setup();
    const { container } = render(<App availabilityDelay={0} />);
    await go('#/resource/excel-beginners');
    await user.click(screen.getByRole('button', { name: /^Register/ }));
    expect(await run(container)).toHaveNoViolations();
  });
});

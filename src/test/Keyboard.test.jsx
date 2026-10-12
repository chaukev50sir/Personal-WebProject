import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

const go = async (hash) => {
  await act(async () => {
    window.location.hash = hash;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
};

describe('Keyboard navigation and focus management', () => {
  it('skip link is the first Tab stop and moves focus to <main>', async () => {
    const user = userEvent.setup();
    render(<App availabilityDelay={0} />);
    await user.tab();
    const skip = screen.getByRole('link', { name: 'Skip to main content' });
    expect(skip).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('header tab order follows visual order: skip link, brand, nav links', async () => {
    const user = userEvent.setup();
    render(<App availabilityDelay={0} />);
    const order = [];
    for (let i = 0; i < 5; i += 1) { await user.tab(); order.push(document.activeElement.textContent); }
    expect(order).toEqual(['Skip to main content', 'Riverside Library Learning Portal', 'Home', 'Courses & archives', 'Book a room']);
  });

  it('view switches move focus to the new <h1>, update the title and set aria-current', async () => {
    render(<App availabilityDelay={0} />);
    await go('#/catalogue');
    const h1 = await screen.findByRole('heading', { level: 1, name: 'Courses and learning archives' });
    await waitFor(() => expect(h1).toHaveFocus());
    expect(document.title).toMatch(/^Courses and archives –/);
    expect(screen.getByRole('link', { name: 'Courses & archives' })).toHaveAttribute('aria-current', 'page');
  });

  it('home search passes the query to the catalogue', async () => {
    const user = userEvent.setup();
    render(<App availabilityDelay={0} />);
    await user.type(screen.getByLabelText('Search courses, archives and events'), 'isiZulu{Enter}');
    await act(async () => { window.dispatchEvent(new HashChangeEvent('hashchange')); });
    expect(await screen.findByLabelText('Search by keyword')).toHaveValue('isiZulu');
  });

  it('modal dialog: focus moves in, Escape closes, focus returns to the trigger', async () => {
    const user = userEvent.setup();
    render(<App availabilityDelay={0} />);
    await go('#/resource/excel-beginners');
    const trigger = await screen.findByRole('button', { name: /^Register\s?: Excel for beginners$/ });
    trigger.focus();
    await user.keyboard('{Enter}');
    const dialog = await screen.findByRole('dialog', { name: /^Register\s?: Excel for beginners$/ });
    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveFocus();
    expect(dialog).toHaveAccessibleDescription(/Press Escape or Cancel/);

    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('modal dialog: confirming moves focus to the success message, not a removed button', async () => {
    const user = userEvent.setup();
    render(<App availabilityDelay={0} />);
    await go('#/resource/cv-workshop');
    await user.click(await screen.findByRole('button', { name: /^Register\s?: CV writing workshop$/ }));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(screen.getByText(/You are registered for CV writing workshop/)).toHaveFocus());
    expect(screen.queryByRole('button', { name: /^Register/ })).not.toBeInTheDocument();
  });

  it('collapsed filter panels are not in the tab order (no invisible focus stops)', async () => {
    const user = userEvent.setup();
    render(<App availabilityDelay={0} />);
    await go('#/catalogue');
    const topicButton = await screen.findByRole('button', { name: /^Topic/ });
    topicButton.focus();
    await user.tab();
    // Topic is collapsed, so the next stop is the Format header, not a topic chip.
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /^Format/ }));
  });
});

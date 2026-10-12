import { describe, it, expect } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Catalogue, { filterResources } from '../pages/Catalogue';
import { RESOURCES } from '../data/resources';
import { renderWithAnnouncer, politeRegion } from './helpers';

const resultCards = () => within(document.getElementById('results-list')).queryAllByRole('article');

describe('filterResources()', () => {
  const none = { query: '', types: [], topics: [], format: 'any' };
  it('returns everything with no filters', () => expect(filterResources(RESOURCES, none)).toHaveLength(RESOURCES.length));
  it('combines type AND topic AND format', () => {
    const r = filterResources(RESOURCES, { ...none, types: ['course'], topics: ['languages'], format: 'online' });
    expect(r.map((x) => x.id)).toEqual(['isizulu-1']);
  });
  it('matches keywords case-insensitively in title and summary', () =>
    expect(filterResources(RESOURCES, { ...none, query: 'TRANSCRIPT' }).length).toBeGreaterThan(0));
});

describe('<Catalogue> ARIA state management', () => {
  it('accordion header toggles aria-expanded and hides/shows its panel', async () => {
    const user = userEvent.setup();
    renderWithAnnouncer(<Catalogue />);
    const topic = screen.getByRole('button', { name: /^Topic/ });
    expect(topic).toHaveAttribute('aria-expanded', 'false');
    const panel = document.getElementById(topic.getAttribute('aria-controls'));
    expect(panel).not.toBeVisible();

    await user.click(topic);
    expect(topic).toHaveAttribute('aria-expanded', 'true');
    expect(panel).toBeVisible();

    topic.focus();
    await user.keyboard('{Enter}');
    expect(topic).toHaveAttribute('aria-expanded', 'false');
    await user.keyboard(' ');
    expect(topic).toHaveAttribute('aria-expanded', 'true');
  });

  it('filter chips toggle aria-pressed, filter results and announce the count (debounced)', async () => {
    const user = userEvent.setup();
    renderWithAnnouncer(<Catalogue />);
    const events = screen.getByRole('button', { name: 'Events' });
    expect(events).toHaveAttribute('aria-pressed', 'false');

    await user.click(events);
    expect(events).toHaveAttribute('aria-pressed', 'true');
    const expected = RESOURCES.filter((r) => r.type === 'event').length;
    expect(resultCards()).toHaveLength(expected);
    await waitFor(() => expect(politeRegion()).toHaveTextContent(`Showing ${expected} of ${RESOURCES.length} resources.`), { timeout: 1500 });

    await user.click(events);
    expect(events).toHaveAttribute('aria-pressed', 'false');
  });

  it('typing does not announce on every keystroke', async () => {
    const user = userEvent.setup();
    renderWithAnnouncer(<Catalogue />);
    await user.type(screen.getByLabelText('Search by keyword'), 'excel');
    expect(politeRegion()).toHaveTextContent(''); // nothing yet: debounce in progress
    await waitFor(() => expect(politeRegion()).toHaveTextContent('Showing 1 of'), { timeout: 1500 });
  });

  it('"Clear all filters" resets state and moves focus to the results heading', async () => {
    const user = userEvent.setup();
    renderWithAnnouncer(<Catalogue />);
    await user.click(screen.getByRole('button', { name: 'Courses' }));
    await user.click(screen.getByRole('button', { name: /Clear all filters/ }));
    expect(screen.getByRole('heading', { name: 'Results' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Courses' })).toHaveAttribute('aria-pressed', 'false');
    expect(resultCards()).toHaveLength(RESOURCES.length);
  });

  it('announces when nothing matches', async () => {
    const user = userEvent.setup();
    renderWithAnnouncer(<Catalogue />);
    await user.type(screen.getByLabelText('Search by keyword'), 'zzzz');
    await waitFor(() => expect(politeRegion()).toHaveTextContent('No resources match your filters.'), { timeout: 1500 });
  });
});

describe('<Catalogue> under React.StrictMode', () => {
  it('does not announce the result count on page load, but does after a change', async () => {
    const { StrictMode } = await import('react');
    const user = userEvent.setup();
    renderWithAnnouncer(<StrictMode><Catalogue /></StrictMode>);
    await new Promise((r) => setTimeout(r, 800));
    expect(politeRegion()).toHaveTextContent('');
    await user.click(screen.getByRole('button', { name: 'Courses' }));
    await waitFor(() => expect(politeRegion()).toHaveTextContent(/^Showing \d+ of/), { timeout: 1500 });
  });
});

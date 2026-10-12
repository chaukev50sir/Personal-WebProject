import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookingForm, { validate, toISODate } from '../components/BookingForm';
import { renderWithAnnouncer, politeRegion } from './helpers';

const inDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return toISODate(d); };
const setup = (props = {}) => {
  const onBooked = vi.fn();
  renderWithAnnouncer(<BookingForm availabilityDelay={0} onBooked={onBooked} {...props} />);
  return { onBooked, user: userEvent.setup() };
};

describe('validate()', () => {
  const base = { name: 'Lindiwe Mokoena', email: 'lindiwe@example.com', room: 'media', date: inDays(2), slot: '09:00', people: '2', needs: '' };
  it('accepts a complete, valid booking', () => expect(validate(base)).toEqual({}));
  it('gives an actionable message for a malformed email', () =>
    expect(validate({ ...base, email: 'lindiwe@' }).email).toMatch(/format name@example\.com/));
  it('rejects dates in the past and outside the 14-day window', () => {
    expect(validate({ ...base, date: inDays(-1) }).date).toMatch(/today or later/);
    expect(validate({ ...base, date: inDays(20) }).date).toMatch(/within the next 14 days/);
  });
  it('checks people against the chosen room capacity', () =>
    expect(validate({ ...base, room: 'quiet-1', people: '5' }).people).toMatch(/holds up to 4/));
});

describe('<BookingForm> labelling', () => {
  it('associates every input with a <label htmlFor>', () => {
    setup();
    for (const name of ['Full name', 'Email address', 'Room', 'Date', 'Number of people', 'Access needs (optional)']) {
      expect(screen.getByLabelText(name)).toBeInTheDocument();
    }
  });
  it('links helper text with aria-describedby', () => {
    setup();
    expect(screen.getByLabelText('Email address')).toHaveAccessibleDescription(/booking confirmation/);
    expect(screen.getByLabelText('Date')).toHaveAccessibleDescription(/14 days ahead/);
  });
});

describe('<BookingForm> live validation', () => {
  it('on blur, sets aria-invalid, appends the error to aria-describedby and announces it politely', async () => {
    const { user } = setup();
    const email = screen.getByLabelText('Email address');
    expect(email).not.toHaveAttribute('aria-invalid');
    await user.type(email, 'lindiwe@');
    expect(email).not.toHaveAttribute('aria-invalid'); // no errors while typing
    await user.tab();
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription(/booking confirmation.*Error: Enter an email address in the format/);
    await waitFor(() => expect(politeRegion()).toHaveTextContent('Email address: Enter an email address in the format'));
  });

  it('clears the error as soon as the value becomes valid', async () => {
    const { user } = setup();
    const email = screen.getByLabelText('Email address');
    await user.type(email, 'lindiwe@');
    await user.tab();
    expect(email).toHaveAttribute('aria-invalid', 'true');
    await user.type(email, 'example.com');
    expect(email).not.toHaveAttribute('aria-invalid');
    expect(email).toHaveAccessibleDescription('We\'ll send your booking confirmation here.');
  });

  it('on an empty submit, shows a summary, moves focus to it, and its links focus the fields', async () => {
    const { user, onBooked } = setup();
    await user.click(screen.getByRole('button', { name: 'Request booking' }));
    const summary = screen.getByRole('heading', { name: /There are 6 problems/ }).parentElement;
    expect(summary).toHaveFocus();
    expect(onBooked).not.toHaveBeenCalled();
    await user.click(within(summary).getByRole('link', { name: 'Enter your email address' }));
    expect(screen.getByLabelText('Email address')).toHaveFocus();
  });
});

describe('<BookingForm> availability + success', () => {
  it('marks the slot group aria-busy while checking, announces availability, then books', async () => {
    const { user, onBooked } = setup({ availabilityDelay: 30 });
    await user.type(screen.getByLabelText('Full name'), 'Lindiwe Mokoena');
    await user.type(screen.getByLabelText('Email address'), 'lindiwe@example.com');
    await user.selectOptions(screen.getByLabelText('Room'), 'media');
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: inDays(3) } });

    const group = screen.getByRole('group', { name: 'Time slot' });
    expect(group).toHaveAttribute('aria-busy', 'true');
    await waitFor(() => expect(group).toHaveAttribute('aria-busy', 'false'));
    await waitFor(() => expect(politeRegion()).toHaveTextContent(/time slots? available in Media room|No time slots are free/));

    const free = within(group).getAllByRole('radio').filter((r) => !r.disabled);
    expect(free.length).toBeGreaterThan(0);
    await user.click(free[0]);
    await user.type(screen.getByLabelText('Number of people'), '2');
    await user.click(screen.getByRole('button', { name: 'Request booking' }));

    expect(onBooked).toHaveBeenCalledWith(expect.objectContaining({ room: 'media', people: '2' }));
    await waitFor(() => expect(politeRegion()).toHaveTextContent(/^Booking confirmed: Media room/));
  });
});

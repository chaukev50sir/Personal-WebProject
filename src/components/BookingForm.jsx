import { useEffect, useId, useRef, useState } from 'react';
import { useAnnounce } from './Announcer';
import ErrorSummary from './ErrorSummary';
import { ROOMS } from '../data/resources';
import { getAvailability } from '../data/availability';

const BOOKING_WINDOW_DAYS = 14;

export const toISODate = (d) => {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

export const LABELS = {
  name: 'Full name',
  email: 'Email address',
  room: 'Room',
  date: 'Date',
  slot: 'Time slot',
  people: 'Number of people',
};

// Messages say how to fix the problem (3.3.3).
export function validate(values, today = new Date()) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Enter your full name';
  else if (values.name.trim().length < 2) errors.name = 'Full name must be at least 2 characters';

  if (!values.email.trim()) errors.email = 'Enter your email address';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = 'Enter an email address in the format name@example.com';
  }

  const room = ROOMS.find((r) => r.id === values.room);
  if (!room) errors.room = 'Choose a room';

  const min = toISODate(today);
  const max = toISODate(addDays(today, BOOKING_WINDOW_DAYS));
  if (!values.date) errors.date = 'Enter a date for your booking';
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date)) errors.date = 'Enter the date in the format YYYY-MM-DD';
  else if (values.date < min) errors.date = 'The date must be today or later';
  else if (values.date > max) errors.date = `The date must be within the next ${BOOKING_WINDOW_DAYS} days (by ${max})`;

  if (!values.slot) errors.slot = 'Choose an available time slot';

  const n = Number(values.people);
  if (values.people === '') errors.people = 'Enter the number of people';
  else if (!Number.isInteger(n) || n < 1) errors.people = 'Number of people must be a whole number, 1 or more';
  else if (room && n > room.capacity) errors.people = `${room.label} holds up to ${room.capacity} people`;

  return errors;
}

const EMPTY = { name: '', email: '', room: '', date: '', slot: '', people: '', needs: '' };
const FIELD_ORDER = ['name', 'email', 'room', 'date', 'slot', 'people'];

export default function BookingForm({ availabilityDelay = 400, onBooked }) {
  const announce = useAnnounce();
  const uid = useId();
  const id = (f) => `${uid}-${f}`.replace(/:/g, '');

  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [summaryErrors, setSummaryErrors] = useState(null);
  const [submitCount, setSubmitCount] = useState(0);
  const [slots, setSlots] = useState(null);
  const [checking, setChecking] = useState(false);

  const summaryRef = useRef(null);

  const room = ROOMS.find((r) => r.id === values.room);

  // Slot availability: aria-busy while loading, result announced when it lands.
  useEffect(() => {
    const dateOk = values.date && !validate({ ...values, slot: 'x' }).date;
    if (!values.room || !dateOk) { setSlots(null); return undefined; }
    let cancelled = false;
    setChecking(true);
    getAvailability(values.room, values.date, availabilityDelay).then((result) => {
      if (cancelled) return;
      setSlots(result);
      setChecking(false);
      const free = result.filter((s) => s.available).length;
      setValues((v) => (result.find((s) => s.id === v.slot && !s.available) ? { ...v, slot: '' } : v));
      announce(free === 0
        ? `No time slots are free in ${room?.label} on ${values.date}. Try another date or room.`
        : `${free} of ${result.length} time slots available in ${room?.label} on ${values.date}.`);
    });
    return () => { cancelled = true; };
    // Only room and date should trigger a re-fetch.
  }, [values.room, values.date]);

  // Keyed on submitCount so every failed submit refocuses the summary.
  useEffect(() => {
    if (submitCount > 0 && summaryErrors) summaryRef.current?.focus();
  }, [submitCount, summaryErrors]);

  const setField = (name, value) => {
    const next = { ...values, [name]: value };
    setValues(next);
    // Clear an existing error as soon as it's fixed; new errors wait for blur.
    if (errors[name]) {
      const msg = validate(next)[name];
      setErrors((e) => ({ ...e, [name]: msg }));
    }
  };

  // Validate on blur, not while typing (mid-word errors are noisy for SR users).
  const onBlur = (name) => () => {
    const msg = validate(values)[name];
    setErrors((e) => ({ ...e, [name]: msg }));
    if (msg && msg !== errors[name]) announce(`${LABELS[name]}: ${msg}`);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const all = validate(values);
    setErrors(all);
    const list = FIELD_ORDER.filter((f) => all[f]).map((f) => ({ field: f, message: all[f] }));
    setSubmitCount((c) => c + 1);
    if (list.length) {
      setSummaryErrors(list);
      return;
    }
    setSummaryErrors(null);
    const slotLabel = slots?.find((s) => s.id === values.slot)?.label;
    const booking = { ...values, roomLabel: room.label, slotLabel };
    announce(`Booking confirmed: ${room.label}, ${values.date}, ${slotLabel}.`);
    onBooked?.(booking);
  };

  const focusField = (field) => {
    if (field === 'slot') {
      const first = document.querySelector(`input[name="${id('slot')}"]:not(:disabled)`)
        || document.getElementById(id('slot-legend-target'));
      first?.focus();
      return;
    }
    document.getElementById(id(field))?.focus();
  };

  const describedBy = (field, hasHint) =>
    [hasHint && `${id(field)}-hint`, errors[field] && `${id(field)}-error`].filter(Boolean).join(' ') || undefined;

  const fieldError = (field) => errors[field] && (
    <span id={`${id(field)}-error`} className="error-text">
      <span className="visually-hidden">Error: </span>{errors[field]}
    </span>
  );

  const today = new Date();

  return (
    <form noValidate onSubmit={onSubmit} aria-labelledby="booking-form-heading" className="booking-form">
      <h2 id="booking-form-heading" tabIndex={-1}>Your reservation</h2>
      <p>All fields are required unless marked optional.</p>

      {summaryErrors && (
        <ErrorSummary ref={summaryRef} errors={summaryErrors.map((e) => ({ ...e, href: `#${id(e.field)}` }))} onSelect={focusField} />
      )}

      <div className={`field ${errors.name ? 'has-error' : ''}`}>
        <label htmlFor={id('name')}>{LABELS.name}</label>
        {fieldError('name')}
        <input type="text" id={id('name')} autoComplete="name" value={values.name}
          aria-invalid={errors.name ? true : undefined} aria-describedby={describedBy('name', false)}
          onChange={(e) => setField('name', e.target.value)} onBlur={onBlur('name')} />
      </div>

      <div className={`field ${errors.email ? 'has-error' : ''}`}>
        <label htmlFor={id('email')}>{LABELS.email}</label>
        <span id={`${id('email')}-hint`} className="hint">We'll send your booking confirmation here.</span>
        {fieldError('email')}
        <input type="email" id={id('email')} autoComplete="email" inputMode="email" value={values.email}
          aria-invalid={errors.email ? true : undefined} aria-describedby={describedBy('email', true)}
          onChange={(e) => setField('email', e.target.value)} onBlur={onBlur('email')} />
      </div>

      <div className={`field ${errors.room ? 'has-error' : ''}`}>
        <label htmlFor={id('room')}>{LABELS.room}</label>
        {fieldError('room')}
        <select id={id('room')} value={values.room}
          aria-invalid={errors.room ? true : undefined} aria-describedby={describedBy('room', false)}
          onChange={(e) => setField('room', e.target.value)} onBlur={onBlur('room')}>
          <option value="">Choose a room</option>
          {ROOMS.map((r) => <option key={r.id} value={r.id}>{r.label} (up to {r.capacity} people)</option>)}
        </select>
      </div>

      <div className={`field ${errors.date ? 'has-error' : ''}`}>
        <label htmlFor={id('date')}>{LABELS.date}</label>
        <span id={`${id('date')}-hint`} className="hint">
          Bookings open up to {BOOKING_WINDOW_DAYS} days ahead. Use the date picker or type the date.
        </span>
        {fieldError('date')}
        <input type="date" id={id('date')} value={values.date}
          min={toISODate(today)} max={toISODate(addDays(today, BOOKING_WINDOW_DAYS))}
          aria-invalid={errors.date ? true : undefined} aria-describedby={describedBy('date', true)}
          onChange={(e) => setField('date', e.target.value)} onBlur={onBlur('date')} />
      </div>

      <fieldset className={`field slot-group ${errors.slot ? 'has-error' : ''}`}
        aria-busy={checking} aria-describedby={describedBy('slot', true)}
        aria-invalid={errors.slot ? true : undefined}>
        <legend id={id('slot-legend-target')} tabIndex={-1}>{LABELS.slot}</legend>
        <span id={`${id('slot')}-hint`} className="hint">
          {checking ? 'Checking availability…'
            : slots ? 'Booked slots cannot be selected.'
              : 'Choose a room and date first to see available times.'}
        </span>
        {fieldError('slot')}
        {slots && slots.map((s) => (
          <div className="choice" key={s.id}>
            <input type="radio" id={`${id('slot')}-${s.id.replace(':', '')}`} name={id('slot')} value={s.id}
              checked={values.slot === s.id} disabled={!s.available}
              onChange={() => setField('slot', s.id)} />
            <label htmlFor={`${id('slot')}-${s.id.replace(':', '')}`}>
              {s.label}{!s.available && <span className="booked"> (booked)</span>}
            </label>
          </div>
        ))}
      </fieldset>

      <div className={`field ${errors.people ? 'has-error' : ''}`}>
        <label htmlFor={id('people')}>{LABELS.people}</label>
        <span id={`${id('people')}-hint`} className="hint">
          {room ? `Between 1 and ${room.capacity} for ${room.label}.` : 'Between 1 and the room’s capacity.'}
        </span>
        {fieldError('people')}
        <input type="number" id={id('people')} inputMode="numeric" min="1" max={room?.capacity ?? 12} value={values.people}
          aria-invalid={errors.people ? true : undefined} aria-describedby={describedBy('people', true)}
          onChange={(e) => setField('people', e.target.value)} onBlur={onBlur('people')} />
      </div>

      <div className="field">
        <label htmlFor={id('needs')}>Access needs (optional)</label>
        <span id={`${id('needs')}-hint`} className="hint">For example: step-free route, screen reader PC, hearing loop.</span>
        <textarea id={id('needs')} rows={3} value={values.needs} aria-describedby={`${id('needs')}-hint`}
          onChange={(e) => setField('needs', e.target.value)} />
      </div>

      <button type="submit" className="button">Request booking</button>
    </form>
  );
}

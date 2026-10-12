import { useEffect, useRef, useState } from 'react';
import PageHeading from '../components/PageHeading';
import BookingForm from '../components/BookingForm';

export default function BookRoom({ availabilityDelay }) {
  const [booking, setBooking] = useState(null);
  const confirmHeadingRef = useRef(null);
  const formKey = useRef(0);

  // The focused button unmounts in both directions, so move focus to the new heading.
  const resetting = useRef(false);
  useEffect(() => {
    if (booking) confirmHeadingRef.current?.focus();
    else if (resetting.current) {
      resetting.current = false;
      document.getElementById('booking-form-heading')?.focus();
    }
  }, [booking]);

  const again = () => {
    formKey.current += 1;
    resetting.current = true;
    setBooking(null);
  };

  return (
    <>
      <PageHeading title="Book a study room">Book a study room</PageHeading>
      <div className="with-sidebar sidebar-right">
        <section aria-label="Booking">
          {booking ? (
            <div className="alert alert-success confirmation">
              <h2 ref={confirmHeadingRef} tabIndex={-1}>Booking confirmed</h2>
              <dl className="details-list">
                <div><dt>Room</dt><dd>{booking.roomLabel}</dd></div>
                <div><dt>Date</dt><dd>{booking.date}</dd></div>
                <div><dt>Time</dt><dd>{booking.slotLabel}</dd></div>
                <div><dt>People</dt><dd>{booking.people}</dd></div>
              </dl>
              <p>A confirmation has been sent to {booking.email}.</p>
              <button type="button" className="button" onClick={again}>Make another booking</button>
            </div>
          ) : (
            <BookingForm key={formKey.current} availabilityDelay={availabilityDelay} onBooked={setBooking} />
          )}
        </section>

        <aside aria-labelledby="before-heading" className="panel">
          <h2 id="before-heading">Before you book</h2>
          <ul>
            <li>Rooms are free for library members.</li>
            <li>Bring your library card on the day.</li>
            <li>The media room has NVDA, ZoomText and a braille display.</li>
            <li>There is no time limit on this form.</li>
          </ul>
        </aside>
      </div>
    </>
  );
}

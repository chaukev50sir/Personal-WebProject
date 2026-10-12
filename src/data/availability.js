import { SLOTS } from './resources';

// Deterministic mock: a slot is booked when hash(room|date|slot) % 3 === 0.
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export function getAvailability(roomId, date, delay = 400) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        SLOTS.map((slot) => ({
          ...slot,
          available: hash(`${roomId}|${date}|${slot.id}`) % 3 !== 0,
        })),
      );
    }, delay);
  });
}

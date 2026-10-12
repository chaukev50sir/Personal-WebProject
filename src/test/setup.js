import '@testing-library/jest-dom/vitest';
import * as matchers from 'vitest-axe/matchers';
import { afterEach, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import { __resetNavigated } from '../hooks/useHashRoute';

expect.extend(matchers);

// jsdom has no showModal()/close(); minimal polyfill for open/close/Escape.
if (typeof HTMLDialogElement !== 'undefined') {
  const proto = HTMLDialogElement.prototype;
  if (!proto.showModal || !String(proto.showModal).includes('native')) {
    proto.showModal = function showModal() {
      this.setAttribute('open', '');
      this._esc = (e) => {
        if (e.key === 'Escape') {
          const ev = new Event('cancel', { cancelable: true });
          this.dispatchEvent(ev);
          if (!ev.defaultPrevented) this.close();
        }
      };
      this.ownerDocument.addEventListener('keydown', this._esc);
    };
    proto.close = function close() {
      if (!this.hasAttribute('open')) return;
      this.removeAttribute('open');
      this.ownerDocument.removeEventListener('keydown', this._esc);
      this.dispatchEvent(new Event('close'));
    };
  }
}

afterEach(() => {
  cleanup();
  window.location.hash = '';
  __resetNavigated();
});

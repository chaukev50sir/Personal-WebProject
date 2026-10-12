import { render } from '@testing-library/react';
import { AnnouncerProvider } from '../components/Announcer';

export const renderWithAnnouncer = (ui) => render(<AnnouncerProvider>{ui}</AnnouncerProvider>);
export const politeRegion = () => document.querySelector('[data-testid="live-polite"]');
export const assertiveRegion = () => document.querySelector('[data-testid="live-assertive"]');

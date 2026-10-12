// Mock catalogue data.

export const TYPES = [
  { id: 'course', label: 'Courses' },
  { id: 'archive', label: 'Digital archives' },
  { id: 'event', label: 'Events' },
];

export const TOPICS = [
  { id: 'digital', label: 'Digital skills' },
  { id: 'languages', label: 'Languages' },
  { id: 'careers', label: 'Careers' },
  { id: 'history', label: 'History' },
  { id: 'finance', label: 'Money & finance' },
];

export const FORMATS = [
  { id: 'any', label: 'Any format' },
  { id: 'online', label: 'Online' },
  { id: 'in-person', label: 'In person' },
];

export const RESOURCES = [
  {
    id: 'excel-beginners', title: 'Excel for beginners', type: 'course', topic: 'digital', format: 'in-person',
    duration: '6 weeks', when: 'Tuesdays, 17:30–19:00',
    summary: 'Spreadsheets, formulas and budgeting. Screen-reader friendly workbooks provided.',
    access: ['Workbooks tested with NVDA and JAWS', 'Step-free classroom'],
  },
  {
    id: 'isizulu-1', title: 'Conversational isiZulu, level 1', type: 'course', topic: 'languages', format: 'online',
    duration: '8 weeks', when: 'Thursdays, 18:00–19:00',
    summary: 'Live sessions with full transcripts and captioned recordings.',
    access: ['Live captions', 'Transcripts within 24 hours'],
  },
  {
    id: 'afrikaans-basics', title: 'Afrikaans for everyday use', type: 'course', topic: 'languages', format: 'in-person',
    duration: '6 weeks', when: 'Saturdays, 10:00–11:30',
    summary: 'Practical phrases for work, shopping and public services.',
    access: ['Large-print handouts', 'Hearing loop in room'],
  },
  {
    id: 'coding-intro', title: 'Introduction to coding with Python', type: 'course', topic: 'digital', format: 'online',
    duration: '10 weeks', when: 'Self-paced',
    summary: 'Beginner programming course with accessible, keyboard-friendly exercises.',
    access: ['All videos captioned', 'Code exercises work with screen readers'],
  },
  {
    id: 'bookkeeping-basics', title: 'Bookkeeping basics for small businesses', type: 'course', topic: 'finance', format: 'in-person',
    duration: '4 weeks', when: 'Mondays, 18:00–19:30',
    summary: 'Cash books, invoices and simple monthly reports.',
    access: ['Materials in accessible Word format'],
  },
  {
    id: 'wc-history', title: 'History of the Western Cape: lecture series', type: 'archive', topic: 'history', format: 'online',
    duration: '10 recordings', when: 'Available any time',
    summary: 'Audio lectures with downloadable text transcripts.',
    access: ['Full text transcripts', 'Audio description where slides are used'],
  },
  {
    id: 'job-interview-archive', title: 'Job interview skills: recorded workshops', type: 'archive', topic: 'careers', format: 'online',
    duration: '6 recordings', when: 'Available any time',
    summary: 'Recorded sessions from past workshops, with captions.',
    access: ['Captions', 'Transcripts'],
  },
  {
    id: 'digital-literacy-ebooks', title: 'Digital literacy e-book collection', type: 'archive', topic: 'digital', format: 'online',
    duration: '24 e-books', when: 'Available any time',
    summary: 'EPUB 3 e-books on email, online safety and using smartphones.',
    access: ['EPUB 3 with navigable headings', 'DAISY versions available'],
  },
  {
    id: 'personal-finance-audio', title: 'Personal finance audiobooks', type: 'archive', topic: 'finance', format: 'online',
    duration: '12 audiobooks', when: 'Available any time',
    summary: 'Budgeting, saving and avoiding debt traps, read aloud.',
    access: ['Audio-first', 'Chapter navigation'],
  },
  {
    id: 'cv-workshop', title: 'CV writing workshop', type: 'event', topic: 'careers', format: 'in-person',
    duration: '2 hours', when: 'Saturday 24 October, 10:00', date: '2026-10-24T10:00',
    summary: 'Bring your CV and get one-on-one feedback from a recruiter.',
    access: ['Step-free main hall', 'Screen reader PCs available'],
  },
  {
    id: 'heritage-talk', title: 'Heritage Month talk: local oral histories', type: 'event', topic: 'history', format: 'in-person',
    duration: '1.5 hours', when: 'Wednesday 28 October, 17:30', date: '2026-10-28T17:30',
    summary: 'Residents share recorded stories from the area.',
    access: ['Sign language interpreter', 'Hearing loop'],
  },
  {
    id: 'online-safety-webinar', title: 'Staying safe online: webinar', type: 'event', topic: 'digital', format: 'online',
    duration: '1 hour', when: 'Thursday 5 November, 18:00', date: '2026-11-05T18:00',
    summary: 'Scams, passwords and privacy settings, explained simply.',
    access: ['Live captions', 'Recording with transcript afterwards'],
  },
];

export const ROOMS = [
  { id: 'quiet-1', label: 'Quiet study room 1', capacity: 4 },
  { id: 'meeting-a', label: 'Meeting room A', capacity: 12 },
  { id: 'media', label: 'Media room (accessible PC, braille display)', capacity: 6 },
];

export const SLOTS = [
  { id: '09:00', label: '09:00 to 11:00' },
  { id: '11:30', label: '11:30 to 13:30' },
  { id: '14:00', label: '14:00 to 16:00' },
];

export const typeLabel = (id) => TYPES.find((t) => t.id === id)?.label.replace(/s$/, '') ?? id;
export const topicLabel = (id) => TOPICS.find((t) => t.id === id)?.label ?? id;
export const formatLabel = (id) => FORMATS.find((f) => f.id === id)?.label ?? id;

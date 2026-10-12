// Computes WCAG 2.1 contrast ratios for every colour pair in the design
// tokens and fails (exit 1) if any pair is below its required threshold.
// Run: npm run contrast
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

// [foreground, background, use, minimum]
const PAIRS = [
  ['#1B2420', '#FFFFFF', 'body text', 4.5],
  ['#1B2420', '#F1F6F3', 'text on panels', 4.5],
  ['#4B5A53', '#FFFFFF', 'hints, tags, input borders', 4.5],
  ['#4B5A53', '#F1F6F3', 'hints and tags on panels', 4.5],
  ['#FFFFFF', '#0E4D3C', 'header text, button labels', 4.5],
  ['#C8E6D9', '#0E4D3C', 'soft header text', 4.5],
  ['#0E4D3C', '#FFFFFF', 'links, secondary buttons', 4.5],
  ['#0E4D3C', '#F1F6F3', 'links on panels', 4.5],
  ['#1B2420', '#F5B700', 'highlighted (focused) link, skip link, badge', 4.5],
  ['#F5B700', '#0E4D3C', 'current-page bar, focus ring in header (non-text)', 3],
  ['#1B2420', '#FFFFFF', 'focus ring outline (non-text)', 3],
  ['#B42318', '#FFFFFF', 'inline error text and border', 4.5],
  ['#B42318', '#FEF3F2', 'error summary', 4.5],
  ['#11603F', '#ECF8F1', 'success message', 4.5],
  ['#FFFFFF', '#1D5FAD', 'pressed chip: digital', 4.5],
  ['#FFFFFF', '#8E2C6B', 'pressed chip: languages', 4.5],
  ['#FFFFFF', '#A34700', 'pressed chip: careers', 4.5],
  ['#FFFFFF', '#7A4A12', 'pressed chip: history', 4.5],
  ['#FFFFFF', '#0B6B6B', 'pressed chip: finance', 4.5],
  ['#1D5FAD', '#EAF1FA', 'topic tag / chip hover: digital', 4.5],
  ['#8E2C6B', '#F8ECF4', 'topic tag / chip hover: languages', 4.5],
  ['#A34700', '#FBF0E6', 'topic tag / chip hover: careers', 4.5],
  ['#7A4A12', '#F6EFE6', 'topic tag / chip hover: history', 4.5],
  ['#0B6B6B', '#E6F4F4', 'topic tag / chip hover: finance', 4.5],
  ['#1D5FAD', '#FFFFFF', 'unpressed chip text and border: digital', 4.5],
  ['#A34700', '#FFFFFF', 'unpressed chip text and border: careers', 4.5],
  ['#1B2420', '#EAF1FA', 'service tile text: digital', 4.5],
  ['#1B2420', '#FBF0E6', 'service tile text: careers', 4.5],
  ['#0E4D3C', '#F8ECF4', 'link on languages service tile', 4.5],
  // Low-fidelity wireframes (wireframes/main.css)
  ['#1B2420', '#E4E8E6', 'wireframe: text in header band', 4.5],
  ['#4B5A53', '#EEF0EF', 'wireframe: hints, placeholder labels on grey', 4.5],
  ['#FFFFFF', '#1B2420', 'wireframe: primary button label', 4.5],
  ['#FFFFFF', '#1D5FAD', 'wireframe annotation tag: <header>', 4.5],
  ['#FFFFFF', '#8E2C6B', 'wireframe annotation tag: <nav>', 4.5],
  ['#FFFFFF', '#11603F', 'wireframe annotation tag: <main>', 4.5],
  ['#FFFFFF', '#A34700', 'wireframe annotation tag: <section>', 4.5],
  ['#FFFFFF', '#6D28D9', 'wireframe annotation tag: <article>', 4.5],
  ['#FFFFFF', '#0B6B6B', 'wireframe annotation tag: <aside>', 4.5],
  ['#FFFFFF', '#4B5A53', 'wireframe annotation tag: <footer>', 4.5],
];

let failed = 0;
for (const [fg, bg, use, min] of PAIRS) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) failed += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${fg} on ${bg}  ${r.toFixed(2)}:1  (min ${min}:1)  ${use}`);
}
console.log(failed ? `\n${failed} pair(s) fail` : '\nAll pairs pass WCAG 2.1 AA');
process.exit(failed ? 1 : 0);

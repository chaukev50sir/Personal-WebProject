// Real-browser accessibility audit: axe-core (all WCAG 2.0/2.1 A + AA rules,
// INCLUDING colour contrast, which jsdom can't check) plus an automated
// record of the Tab sequence on every view and the wireframes.
//
// Usage:  npm run build && npx vite preview --port 4173 &
//         CHROME_PATH=/path/to/chrome npm run audit:axe
// Without CHROME_PATH it uses Playwright's own Chromium (npx playwright install chromium).
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/';
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: ['--no-sandbox'],
});
const context = await browser.newContext();
const page = await context.newPage();
const report = [];

async function audit(label, setup) {
  await setup();
  await page.waitForTimeout(300);
  const res = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  report.push({
    label,
    violations: res.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help })),
    passes: res.passes.length,
    incomplete: res.incomplete.map((i) => i.id),
  });
}

async function tabSequence(label, url, max = 40) {
  await page.goto(url);
  await page.waitForTimeout(200);
  const seq = [];
  for (let i = 0; i < max; i += 1) {
    await page.keyboard.press('Tab');
    const d = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const name = (el.getAttribute('aria-label') || el.labels?.[0]?.textContent || el.textContent || el.value || '').trim().replace(/\s+/g, ' ').slice(0, 60);
      const cs = getComputedStyle(el);
      const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2;
      // Text contrast in the focused state. axe only checks the resting state,
      // so a highlighter background with the wrong text colour would slip past.
      const hex = (c) => (c.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number);
      const lum = (rgb) => rgb.map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
        .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
      let bgEl = el; let bg = cs.backgroundColor;
      while (bgEl && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) { bgEl = bgEl.parentElement; bg = bgEl ? getComputedStyle(bgEl).backgroundColor : 'rgb(255,255,255)'; }
      const [a, b] = [lum(hex(cs.color)), lum(hex(bg))].sort((x, y) => y - x);
      const focusContrast = Math.round(((a + 0.05) / (b + 0.05)) * 100) / 100;
      return { tag: el.tagName.toLowerCase(), type: el.type || '', name, visibleFocus: outline, focusContrast };
    });
    if (!d) break;
    if (seq.length && JSON.stringify(seq[0]) === JSON.stringify(d)) break; // wrapped around
    seq.push(d);
  }
  return { label, stops: seq.length, missingFocusRing: seq.filter((s) => !s.visibleFocus).length, lowFocusContrast: seq.filter((s) => s.focusContrast < 4.5 && s.name).map((s) => `${s.name} ${s.focusContrast}:1`), seq };
}

const app = (hash) => async () => { await page.goto(`${BASE}${hash}`); };

await audit('React: home', app('#/'));
await audit('React: catalogue', app('#/catalogue'));
await audit('React: catalogue, all panels open, filter on', async () => {
  await page.goto(`${BASE}#/catalogue`);
  await page.getByRole('button', { name: /^Topic/ }).click();
  await page.getByRole('button', { name: /^Format/ }).click();
  await page.getByRole('button', { name: 'Languages' }).click();
});
await audit('React: resource detail', app('#/resource/wc-history'));
await audit('React: dialog open', async () => {
  await page.goto(`${BASE}#/resource/excel-beginners`);
  await page.getByRole('button', { name: /^Register/ }).click();
});
await audit('React: booking form', app('#/book'));
await audit('React: booking form, error state', async () => {
  await page.goto(`${BASE}#/book`);
  await page.getByRole('button', { name: 'Request booking' }).click();
});

for (const f of ['index.html', 'search.html', 'book.html']) {
  const url = pathToFileURL(resolve('wireframes', f)).href;
  await audit(`Wireframe: ${f}`, async () => { await page.goto(url); });
}

const tabs = [];
tabs.push(await tabSequence('React: home', `${BASE}#/`));
tabs.push(await tabSequence('React: catalogue', `${BASE}#/catalogue`));
tabs.push(await tabSequence('React: booking form', `${BASE}#/book`));
tabs.push(await tabSequence('Wireframe: index.html', pathToFileURL(resolve('wireframes', 'index.html')).href));
tabs.push(await tabSequence('Wireframe: search.html', pathToFileURL(resolve('wireframes', 'search.html')).href));
tabs.push(await tabSequence('Wireframe: book.html', pathToFileURL(resolve('wireframes', 'book.html')).href));

// Keyboard trap check: from the dialog, Tab must cycle within it and Escape must close it.
await page.goto(`${BASE}#/resource/excel-beginners`);
await page.getByRole('button', { name: /^Register/ }).focus();
await page.keyboard.press('Enter');
await page.waitForTimeout(100);
const inDialog = [];
for (let i = 0; i < 4; i += 1) {
  inDialog.push(await page.evaluate(() => !!document.activeElement.closest('dialog')));
  await page.keyboard.press('Tab');
}
await page.keyboard.press('Escape');
await page.waitForTimeout(100);
const afterEsc = await page.evaluate(() => document.activeElement.textContent.trim());
const dialogCheck = { focusStaysInDialogWhileOpen: inDialog, focusAfterEscape: afterEsc };

await browser.close();
const out = { generated: new Date().toISOString(), axe: report, tabSequences: tabs, dialogCheck };
writeFileSync('docs/audit/axe-report.json', JSON.stringify(out, null, 2));
const total = report.reduce((n, r) => n + r.violations.length, 0);
console.table(report.map((r) => ({ page: r.label, violations: r.violations.length, passes: r.passes, incomplete: r.incomplete.join(',') })));
console.log(tabs.map((t) => `${t.label}: ${t.stops} tab stops, ${t.missingFocusRing} without a visible focus ring, focused-text contrast failures: ${t.lowFocusContrast.length ? t.lowFocusContrast.join('; ') : 'none'}`).join('\n'));
console.log('Dialog:', JSON.stringify(dialogCheck));
console.log(total === 0 ? 'axe: 0 violations' : `axe: ${total} violation types`);
const focusFails = tabs.reduce((n, t) => n + t.lowFocusContrast.length + t.missingFocusRing, 0);
process.exit(total === 0 && focusFails === 0 ? 0 : 1);

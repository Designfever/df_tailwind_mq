import { version } from '../package.json';
import Mq, { getMqByString } from './mq';

const versionEl = document.getElementById('version') as HTMLElement;
const inputEl = document.getElementById('input1') as HTMLInputElement;
const outputEl = document.getElementById('output1') as HTMLTextAreaElement;
const breakpointsEl = document.getElementById('opt-breakpoints') as HTMLInputElement;
const ratioEl = document.getElementById('opt-ratio') as HTMLInputElement;
const autoRatioEl = document.getElementById('opt-auto-ratio') as HTMLInputElement;
const overlapEl = document.getElementById('opt-overlap') as HTMLInputElement;

if (versionEl) versionEl.textContent = version;

function applyOptions() {
  const bpRaw = breakpointsEl.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  if (bpRaw.length >= 2) Mq.setBreakPoint(bpRaw);

  const ratio = parseFloat(ratioEl.value);
  if (!isNaN(ratio) && ratio > 0) Mq.setMobileRatio(ratio);

  Mq.setSupportCalcAutoRatio(autoRatioEl.checked);
  Mq.setOverlap(overlapEl.checked);
}

function update() {
  applyOptions();
  if (!inputEl.value) { outputEl.value = ''; return; }
  outputEl.value = getMqByString(inputEl.value, true) as string;
}

inputEl.addEventListener('input', update);
breakpointsEl.addEventListener('change', update);
ratioEl.addEventListener('change', update);
autoRatioEl.addEventListener('change', update);
overlapEl.addEventListener('change', update);

inputEl.value = 'width|100px<200px<300px';
update();

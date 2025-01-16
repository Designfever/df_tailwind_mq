import { version } from '../package.json';
import Mq, { getMqByString } from './mq';

const versionEl = document.getElementById('version') as HTMLInputElement;
const inputEl = document.getElementById('input1') as HTMLInputElement;
const outputEl = document.getElementById('output1') as HTMLInputElement;
const breakPointEl = document.getElementById('breakpoint') as HTMLInputElement;

// Mq.breakPoint = [100, 200, 300, 301];
// Mq.constantStyle = {
//   TEST:100
// }

if (versionEl) {
  versionEl.innerHTML = version;
}

if (breakPointEl) {
  breakPointEl.innerHTML = Mq.breakPoint.join('px < ') + 'px';
}

if (inputEl && outputEl) {
  inputEl.addEventListener('input', (e) => {
    const el = e.target as HTMLInputElement;
    if (!el) return;

    const str = el.value;
    outputEl.value = getMqByString(str, true) as string;
  });

  inputEl.value = 'width|100px<200px<300px';
  outputEl.value = getMqByString('width|100px<200px<300px', true) as string;
}

/***
 width|100px<200px<300px
 {
 width: '32.25806451612903vw',
 '@media (min-width : 621px)': { width: '19.53125vw' },
 '@media (min-width : 1025px)': { width: '23.4375vw' },
 '@media (min-width : 1281px)': { width: '300px' }
 }

 ***/
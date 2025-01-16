import Mq from './mq';

const input1 = document.getElementById('input1') as HTMLInputElement;
const output1 = document.getElementById('output1') as HTMLInputElement;

function getMqByString(str: string) {
  const strArray = String(str).split('|');
  const property = strArray[0];
  const valueArray = String(strArray[1]).split('<');

  const rtnValue =JSON.stringify( new Mq(property, valueArray).value,null,2);
  return  rtnValue.replace(/"/g, '').replace(/,/g, '\n');
}

if (input1 && output1) {
  input1.addEventListener('input', (e) => {
    const el = e.target as HTMLInputElement;
    if (!el) return;

    const str = el.value;
    output1.value = getMqByString(str);
  });

  input1.value = 'width|100px<200px<300px';
  output1.value = getMqByString('width|100px<200px<300px');
}
import Mq from './mq'

//@ts-ignore
export default function ({ matchUtilities, theme }) {
  matchUtilities({
    mq: (str:string) => {
      const strArray = String(str).split('|');
      const property = strArray[0];
      const valueArray = String(strArray[1]).split('<');

      return new Mq(property, valueArray).value;
    }
  })
};

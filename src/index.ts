import Mq, { getMqByString } from './mq';

//@ts-ignore
export default function ({ matchUtilities, theme }) {
  matchUtilities({
    mq: (str:string) => {
      return getMqByString(str);
    }
  })
};

export { Mq };
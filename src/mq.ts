const MIN_WIDTH_MOBILE = 620;
const MIN_WIDTH_TABLET = 1024;
const MIN_WIDTH_DESKTOP = 1280;

interface IDictionary<T> {
  [index: string]: T;
}

interface IUnitData {
  [index: string]: IUnit;
}

interface IUnit {
  unit: string;
  reg: RegExp | null;
}

export const UNIT_STORED: IUnitData = {
  TYPE_PX: { unit: 'px', reg: new RegExp(/([0-9.]+)px/) },
  TYPE_STATIC_PX: { unit: 'spx', reg: new RegExp(/([0-9.]+)spx/) },
  TYPE_UNDEFINED: { unit: '', reg: null }
};

export function getMqByString(str: string, isString = false) {
  const strArray = String(str).split('|');
  const property = strArray[0];
  const valueArray = String(strArray[1]).split('<');

  const rtnObj = new Mq(property, valueArray).value;

  if (!isString) {
    return rtnObj;
  }

  const rtnValue = JSON.stringify(rtnObj, null, 2);
  return rtnValue.replace(/"/g, '').replace(/,\n/g, '\n');
}

class Mq {
  private _valueArray: Array<string> = [];
  private isDebug = false;
  private static breakPoint = [
    MIN_WIDTH_MOBILE,
    MIN_WIDTH_TABLET,
    MIN_WIDTH_DESKTOP,
    MIN_WIDTH_DESKTOP + 1
  ];
  private static mobileRatio = 2;
  private static MAX_DIGIT = 5;
  public static constantStyle = {};
  public static get getBreakPoint() {
    return Mq.breakPoint;
  }
  public static setBreakPoint(value: Array<number>) {
    Mq.breakPoint = value;
    Mq.breakPoint.push(value[value.length - 1] + 1);
  }
  public static setMobileRatio(value: number) {
    Mq.mobileRatio = value;
  }

  constructor(
    private property: string,
    origin: Array<string>
  ) {
    // console.log(Mq.breakPoint);
    // console.log(origin);

    let lastValue = origin[0];
    Mq.breakPoint.forEach((value, index) => {
      if (origin[index] && index < Mq.breakPoint.length - 1) {
        this._valueArray.push(this.getValue(origin[index], index));
        lastValue = origin[index];
      } else {
        this._valueArray.push(this.getValue(lastValue, index, true));
      }
    });
  }

  get value() {
    const obj: IDictionary<IDictionary<string> | string> = {};
    obj[this.property] = this.getValue(this._valueArray[0], 0, true);

    for (let i = 0; i < Mq.breakPoint.length - 1; i++) {
      obj[`@media (min-width : ${Mq.breakPoint[i] + 1}px)`] = {
        [this.property]: this._valueArray[i + 1]
      };
    }

    if (this.isDebug) console.log(obj);
    return obj;
  }

  private getVw(value: string, width: number, isStatic = false): string {
    // const unit = this.getUnitType(value);

    if (width === Mq.breakPoint[0]) {
      width = width / Mq.mobileRatio;
    }

    if (!isStatic) {
      const match = value.match(/([0-9.]+)(px)/g);

      if (match) {
        match.forEach((str) => {
          const px = parseFloat(str.replace('px', ''));
          const vw = (px / width) * 100;
          value = value.replace(str, `${vw.toFixed(Mq.MAX_DIGIT)}vw`);
        });
      }
    }

    value = value.replace(/spx/g, 'px');
    return value;
  }

  private setChangeConstant(origin: string) {
    let rtn = origin.trim();

    for (const key of Object.keys(Mq.constantStyle)) {
      // @ts-ignore
      const keyString = key.replace(new RegExp('_', 'g'), ' ');
      // @ts-ignore

      rtn = rtn.replace(
        new RegExp(`${keyString}`, 'g'),
        // @ts-ignore
        `${Mq.constantStyle[key]}${typeof Mq.constantStyle[key] === 'number' ? 'px' : ''}`
      );
    }

    return rtn;
  }

  private getValue(origin: string, index = 0, isStatic = false, token = ' ') {
    let value = '';

    // desktop 에서는 맥스 사이즈 이므로 vw 연산을 하지 않도록 함.
    if (index === Mq.breakPoint.length - 1) {
      isStatic = true;
    }

    origin = this.setChangeConstant(origin);

    if (!isStatic) {
      const splitValueArray = origin.split(token);

      if (splitValueArray.length > 0) {
        splitValueArray.forEach((_value, order) => {
          value += order !== 0 ? token : '';
          value += this.getVw(_value, Mq.breakPoint[index]);
        });
      } else {
        value = this.getVw(origin, Mq.breakPoint[index]);
      }
    } else {
      value = this.getVw(origin, Mq.breakPoint[index], true);
    }

    return value.trim();
  }
}

export default Mq;

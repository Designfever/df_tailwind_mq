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
  return rtnValue.replace(/"/g, '').replace(/,/g, '\n');
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
  private static MAX_DIGIT = 5;
  public static constantStyle = {};
  public static get getBreakPoint() {
    return Mq.breakPoint;
  }
  public static setBreakPoint(value: Array<number>) {
    Mq.breakPoint = value;
    Mq.breakPoint.push(Mq.breakPoint[Mq.breakPoint.length - 1] + 1);
  }

  constructor(
    private property: string,
    origin: Array<string>
  ) {
    origin.forEach((value, index) => {
      this._valueArray.push(this.getValue(value, index));
    });

    for (let i = this._valueArray.length; i < Mq.breakPoint.length; i++) {
      this._valueArray.push(this.getValue(origin[origin.length - 1], i, true));
    }
  }
  //
  // get valueArray() {
  //   return this._valueArray;
  // }

  get value() {
    const obj: IDictionary<IDictionary<string> | string> = {};
    obj[this.property] = this.getValue(this._valueArray[0], 0, true);

    for (let i = 0; i < Mq.breakPoint.length - 1; i++) {
      obj[`@media (min-width : ${Mq.breakPoint[i] + 1}px)`] = {
        [this.property]: this._valueArray[i]
      };
    }

    if (this.isDebug) console.log(obj);
    return obj;
  }

  private getUnitType(value: string): string {
    for (const key in UNIT_STORED) {
      if (UNIT_STORED[key].reg?.test(value)) return key;
    }
    return 'TYPE_UNDEFINED';
  }

  private getVw(value: string, width: number, isStatic = false): string {
    // const unit = this.getUnitType(value);

    if (width === Mq.breakPoint[0]) {
      width = width / 2;
    }

    if (!isStatic) {
      const match = value.match(/([0-9.]+)(px)/g);
      console.log(match);

      if (match) {
        match.forEach((str) => {
          const px = parseFloat(str.replace('px', ''));
          const vw = (px / width) * 100;
          value = value.replace(str, `${vw.toFixed(Mq.MAX_DIGIT)}vw`);
        });
      }
    }

    value = value.replace(/spx/g, 'px');

    // value = value;

    // if (UNIT_STORED[unit].unit === UNIT_STORED.TYPE_PX.unit && !isStatic) {
    //   const transformValue = `${(parseFloat(value) / width) * 100}vw`;
    //   value = String(value).replace(parseFloat(value) + 'px', transformValue);
    // } else if (UNIT_STORED[unit].unit === UNIT_STORED.TYPE_STATIC_PX.unit || isStatic) {
    //   return value.replace(UNIT_STORED.TYPE_STATIC_PX.unit, UNIT_STORED.TYPE_PX.unit);
    // }

    return value;
  }

  private setChangeConstant(origin: string) {
    console.log('setChangeConstant', origin);
    console.log(Mq.constantStyle);
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

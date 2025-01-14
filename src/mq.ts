// import ConstantStyle from './../constant/constant.style';

const MIN_WIDTH_MOBILE = 620;
const MIN_WIDTH_TABLET =1024;
const MIN_WIDTH_DESKTOP = 1280;


const ConstantStyle = {
  MIN_WIDTH_MOBILE:MIN_WIDTH_MOBILE,
  MIN_WIDTH_TABLET:MIN_WIDTH_TABLET,
  MIN_WIDTH_DESKTOP:MIN_WIDTH_DESKTOP,

  MEDIA_BREAK_POINTS : [
    MIN_WIDTH_MOBILE,
    MIN_WIDTH_TABLET,
    MIN_WIDTH_DESKTOP,
    MIN_WIDTH_DESKTOP + 1
  ]
}

interface IDictionary<T> {
  [index: string]: T;
}

export enum TYPE_SIZE {
  MOBILE,
  TABLET_VERTICAL,
  TABLE_HORIZONTAL,
  DESKTOP
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

class Mq {
  private _valueArray: Array<string> = [];
  private isDebug = false;

  constructor(
    private property: string,
    origin: Array<string>
  ) {
    origin.forEach((value, index) => {
      this._valueArray.push(this.getValue(value, index));
    });

    for (let i = this._valueArray.length; i < ConstantStyle.MEDIA_BREAK_POINTS.length; i++) {
      this._valueArray.push(this.getValue(origin[origin.length - 1], i, true));
    }
  }

  get valueArray() {
    return this._valueArray;
  }

  get value() {
    const obj: IDictionary<IDictionary<string> | string> = {};
    obj[this.property] = this.getValue(this._valueArray[0], 0, true);

    obj[`@media (min-width : ${ConstantStyle.MEDIA_BREAK_POINTS[0] + 1}px)`] = {
      [this.property]: this._valueArray[1]
    };

    obj[`@media (min-width : ${ConstantStyle.MEDIA_BREAK_POINTS[1] + 1}px)`] = {
      [this.property]: this._valueArray[2]
    };

    obj[`@media (min-width : ${ConstantStyle.MEDIA_BREAK_POINTS[2] + 1}px)`] = {
      [this.property]: this._valueArray[3]
    };

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
    const unit = this.getUnitType(value);

    if (width === ConstantStyle.MIN_WIDTH_MOBILE) {
      width = width / 2;
    }

    if (UNIT_STORED[unit].unit === UNIT_STORED.TYPE_PX.unit && !isStatic) {
      const transformValue = `${(parseFloat(value) / width) * 100}vw`;
      value = String(value).replace(parseFloat(value) + 'px', transformValue);
    } else if (UNIT_STORED[unit].unit === UNIT_STORED.TYPE_STATIC_PX.unit || isStatic) {
      return value.replace(UNIT_STORED.TYPE_STATIC_PX.unit, UNIT_STORED.TYPE_PX.unit);
    }

    return value;
  }

  private setChangeConstant(origin: string) {
    let rtn = origin.trim();

    for (const key of Object.keys(ConstantStyle)) {
      // @ts-ignore
      const keyString = key.replace(new RegExp('_', 'g'), ' ');
      // @ts-ignore
      if (typeof ConstantStyle[key] === 'number') {
        rtn = rtn.replace(
          new RegExp(`\\b${keyString}\\b`, 'g'),
          // @ts-ignore
          `${ConstantStyle[key]}px`
        );
      }
    }

    return rtn;
  }

  private getValue(origin: string, index = TYPE_SIZE.MOBILE, isStatic = false, token = ' ') {
    let value = '';

    // desktop 에서는 맥스 사이즈 이므로 vw 연산을 하지 않도록 함.
    if (index === TYPE_SIZE.DESKTOP) {
      isStatic = true;
    }

    origin = this.setChangeConstant(origin);

    if (!isStatic) {
      const splitValueArray = origin.split(token);

      if (splitValueArray.length > 0) {
        splitValueArray.forEach((_value, order) => {
          value += order !== 0 ? token : '';
          value += this.getVw(_value, ConstantStyle.MEDIA_BREAK_POINTS[index]);
        });
      } else {
        value = this.getVw(origin, ConstantStyle.MEDIA_BREAK_POINTS[index]);
      }
    } else {
      value = this.getVw(origin, ConstantStyle.MEDIA_BREAK_POINTS[index], true);
    }

    return value.trim();
  }
}

export default Mq;

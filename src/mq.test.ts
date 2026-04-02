import { describe, it, expect, beforeEach } from 'vitest';
import Mq, { getMqByString } from './mq';

// 각 테스트 전 기본값으로 초기화
beforeEach(() => {
  Mq.setBreakPoint([620, 1024, 1280]);
  Mq.setMobileRatio(2);
  Mq.setSupportCalcAutoRatio(false);
  Mq.setOverlap(false);
  Mq.constantStyle = {};
});

describe('기본 px → vw 변환', () => {
  it('3개 값: mobile / tablet / desktop', () => {
    const result = getMqByString('width|100px<200px<300px') as Record<string, any>;
    // mobile: (100/310)*100, tablet: (200/1024)*100, desktop: (300/1280)*100
    expect(result['width']).toBe('32.25806vw');
    expect(result['@media (min-width : 621px)']['width']).toBe('19.53125vw');
    expect(result['@media (min-width : 1025px)']['width']).toBe('23.43750vw');
    expect(result['@media (min-width : 1281px)']['width']).toBe('300px');
  });

  it('2개 값: mobile / tablet~desktop 동일', () => {
    const result = getMqByString('display|none<block') as Record<string, any>;
    expect(result['display']).toBe('none');
    expect(result['@media (min-width : 621px)']['display']).toBe('block');
    expect(result['@media (min-width : 1025px)']['display']).toBe('block');
  });

  it('1개 값: 전 구간 동일', () => {
    const result = getMqByString('overflow|hidden') as Record<string, any>;
    expect(result['overflow']).toBe('hidden');
    expect(result['@media (min-width : 621px)']['overflow']).toBe('hidden');
  });
});

describe('spx (static px)', () => {
  it('spx는 vw 변환 없이 px 유지', () => {
    const result = getMqByString('border-width|2spx<4spx<4spx') as Record<string, any>;
    expect(result['border-width']).toBe('2px');
    expect(result['@media (min-width : 621px)']['border-width']).toBe('4px');
  });
});

describe('공백 포함 값', () => {
  it('padding shorthand: 스페이스로 구분된 다중 값', () => {
    // getMqByString은 실제 공백을 받음 (Tailwind가 _ → 공백 변환 담당)
    const result = getMqByString('padding|0 0 0 10px<0 0 0 20px') as Record<string, any>;
    expect(result['padding']).toBe('0 0 0 3.22581vw');
    expect(result['@media (min-width : 621px)']['padding']).toBe('0 0 0 1.95313vw');
  });
});

describe('setMobileRatio', () => {
  it('ratio=1이면 breakPoint[0] 그대로 vw 기준', () => {
    Mq.setMobileRatio(1);
    const result = getMqByString('width|620px') as Record<string, any>;
    // (620/620)*100 = 100.00000
    expect(result['width']).toBe('100.00000vw');
  });
});

describe('setBreakPoint', () => {
  it('커스텀 브레이크포인트', () => {
    Mq.setBreakPoint([375, 768, 1440]);
    // 내부 breakPoint = [375, 768, 1440, 1441]
    // mobile vw base = 375/2 = 187.5
    const result = getMqByString('width|100px<200px<300px') as Record<string, any>;
    const mobileVw = ((100 / 187.5) * 100).toFixed(5);
    expect(result['width']).toBe(`${mobileVw}vw`);
    // desktop(index 2, 1440): vw 변환 (최대 브레이크포인트가 아님)
    // max(index 3, 1441): px 고정
    expect(result['@media (min-width : 1441px)']['width']).toBe('300px');
  });
});

describe('constantStyle', () => {
  it('number 상수 → px 자동 추가 후 vw 변환', () => {
    Mq.constantStyle = { HEADER: 60 };
    const result = getMqByString('height|HEADER') as Record<string, any>;
    // 60px → (60/310)*100 on mobile
    const expected = ((60 / 310) * 100).toFixed(5);
    expect(result['height']).toBe(`${expected}vw`);
  });

  it('상수 이름의 _ → 공백: Tailwind 클래스에서 치환, 직접 호출은 공백 그대로', () => {
    // constantStyle key 'BORDER SOLID' (공백) → 값 내 'BORDER SOLID' 치환
    Mq.constantStyle = { 'BORDER SOLID': '1spx solid red' };
    const result = getMqByString('border|BORDER SOLID') as Record<string, any>;
    expect(result['border']).toBe('1px solid red');
  });
});

describe('setSupportCalcAutoRatio', () => {
  it('1개 값에서 desktop 자동 계산', () => {
    Mq.setSupportCalcAutoRatio(true);
    const result = getMqByString('width|100px') as Record<string, any>;
    // desktop = (100 * 1280 / 620) px → static px at max bp
    const desktopPx = parseFloat(((100 * 1280) / 620).toFixed(5));
    expect(result['@media (min-width : 1281px)']['width']).toBe(`${desktopPx}px`);
  });

  it('2개 값에서 tablet 자동 보간', () => {
    Mq.setSupportCalcAutoRatio(true);
    const result = getMqByString('width|100px<300px') as Record<string, any>;
    // tablet = 300 * 1024/1280 = 240px → vw: (240/1024)*100
    const tabletVw = ((240 / 1024) * 100).toFixed(5);
    expect(result['@media (min-width : 621px)']['width']).toBe(`${tabletVw}vw`);
  });
});

describe('setOverlap', () => {
  it('첫 번째 bp 이후 중복 값 미디어 쿼리 생략', () => {
    Mq.setOverlap(true);
    const result = getMqByString('display|block<block<block') as Record<string, any>;
    // i=0 (prior=undefined → 첫 번째는 생략 안 됨)
    expect(result['@media (min-width : 621px)']['display']).toBe('block');
    // i=1,2 (prior='block' → 같으면 생략)
    expect(result['@media (min-width : 1025px)']).toBeUndefined();
    expect(result['@media (min-width : 1281px)']).toBeUndefined();
  });
});

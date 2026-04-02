# @designfever/tailwind-mq

Tailwind CSS 플러그인. `px` 값을 브레이크포인트별 `vw`로 자동 변환하는 반응형 유틸리티.

## 설치

```bash
npm install @designfever/tailwind-mq
```

## 설정

`tailwind.config.js`에 플러그인 추가:

```js
import { plugin } from 'tailwindcss/plugin';
import TailwindMq, { Mq } from '@designfever/tailwind-mq';

// 옵션 설정 (선택)
Mq.setBreakPoint([620, 1024, 1280]);   // 기본값
Mq.setMobileRatio(2);                  // 기본값

export default {
  plugins: [plugin(TailwindMq)],
};
```

## 기본 사용법

```
mq-[property|mobile<tablet<desktop]
```

- 값은 `<`로 구분, 브레이크포인트 순서대로 입력
- `px` → 각 브레이크포인트 기준 `vw`로 자동 변환
- 마지막 브레이크포인트(desktop max)는 항상 `px` 유지
- 값을 생략하면 이전 값이 그대로 이어짐
- 공백은 `_`로 대체 (Tailwind 이스케이프)

```html
<!-- 3개 값: mobile / tablet / desktop -->
<div class="mq-[width|100px<200px<300px]"></div>

<!-- 2개 값: mobile / tablet~desktop -->
<div class="mq-[display|none<block]"></div>

<!-- 공백 포함 (padding shorthand) -->
<div class="mq-[padding|0_0_0_10px<0_0_0_20px<0_0_0_30px]"></div>
```

## 브레이크포인트

기본값: `[620, 1024, 1280]`

| 구간 | 조건 | vw 기준 |
|------|------|---------|
| Mobile | `≤ 620px` | `620 / mobileRatio` (기본 310) |
| Tablet | `621px ~ 1024px` | `1024` |
| Desktop | `1025px ~ 1280px` | `1280` |
| Max | `≥ 1281px` | px 고정 (변환 없음) |

## 단위

| 단위 | 설명 |
|------|------|
| `px` | vw로 변환됨 |
| `spx` | static px — vw 변환 없이 px 유지 |

```html
<!-- 10px는 vw로 변환, 2spx는 px 유지 -->
<div class="mq-[border|1spx_solid_transparent<2spx_solid_black]"></div>
```

## API

### `Mq.setBreakPoint(value: number[])`

브레이크포인트 배열 설정. 내부적으로 마지막 값 +1이 자동 추가됨.

```js
Mq.setBreakPoint([375, 768, 1440]);
```

### `Mq.setMobileRatio(value: number)`

모바일 vw 계산 시 기준 너비를 `breakPoint[0] / ratio`로 나눔. 디자인 시안이 실제 뷰포트의 2배 해상도일 때 `2` 사용.

```js
Mq.setMobileRatio(2); // 620 / 2 = 310px 기준
```

### `Mq.constantStyle`

자주 쓰는 px 값을 상수로 등록. 클래스에서 이름으로 참조 가능. `number` 타입은 자동으로 `px` 단위 추가.

```js
Mq.constantStyle = {
  HEADER: 60,      // → 60px
  GUTTER: 20,      // → 20px
};
```

```html
<div class="mq-[padding-top|HEADER]"></div>
<div class="mq-[margin|0_GUTTER]"></div>
```

상수 이름의 `_`는 공백으로 치환됨 (`BORDER_SOLID` → `border solid`).

### `Mq.setSupportCalcAutoRatio(value: boolean)`

값 개수가 부족할 때 비율로 자동 보간.

- 값 1개: mobile 기준으로 tablet, desktop 비율 계산
- 값 2개: `[mobile, desktop]`으로 tablet 자동 보간

```js
Mq.setSupportCalcAutoRatio(true);
```

```html
<!-- 1개만 입력해도 tablet/desktop 자동 계산 -->
<div class="mq-[width|100px]"></div>
```

### `Mq.setOverlap(value: boolean)`

`true`로 설정하면 이전 브레이크포인트와 값이 동일한 경우 미디어 쿼리 생략.

```js
Mq.setOverlap(true);
```

### `getMqByString(str, isString?)`

클래스 문자열을 직접 파싱하는 유틸 함수.

```js
import { getMqByString } from '@designfever/tailwind-mq';

getMqByString('width|100px<200px<300px');
// {
//   width: '32.25806vw',
//   '@media (min-width : 621px)': { width: '19.53125vw' },
//   '@media (min-width : 1025px)': { width: '23.4375vw' },
//   '@media (min-width : 1281px)': { width: '300px' }
// }

getMqByString('width|100px<200px<300px', true); // string 반환
```

## 예시

```html
<!-- font-size -->
<p class="mq-[font-size|14px<16px<18px]"></p>

<!-- display 전환 -->
<div class="mq-[display|none<block]"></div>

<!-- transform -->
<div class="mq-[transform|translateX(10px)<translateX(20px)]"></div>

<!-- 고정값 혼용 (spx) -->
<div class="mq-[border-width|1spx<2spx<2spx]"></div>
```

## License

MIT
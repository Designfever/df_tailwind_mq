# @designfever/tailwind-mq

[![npm version](https://img.shields.io/npm/v/%40designfever%2Ftailwind-mq.svg)](https://www.npmjs.com/package/@designfever/tailwind-mq)
[![npm downloads](https://img.shields.io/npm/dm/%40designfever%2Ftailwind-mq.svg)](https://www.npmjs.com/package/@designfever/tailwind-mq)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

Tailwind CSS plugin for keeping design-specified `px` values readable in code while generating responsive `vw` output for each breakpoint.

**[Demo](https://df-tailwind-mq.vercel.app/)**

`@designfever/tailwind-mq` was built for visual design-heavy web projects where small spacing, typography, and layout differences are easy to notice. It lets frontend teams keep the exact pixel values from design specs in Tailwind classes, then converts those values into breakpoint-aware viewport units at build time.

## Project Context

This package is maintained by Designfever for production brand-site and campaign-site workflows where teams need to translate fixed design files into responsive frontend code without losing the original visual rhythm.

The public package keeps that workflow reusable across Tailwind CSS projects instead of leaving it as a private one-off utility.

## Why

Brand sites, campaign pages, and other visual design-driven projects often start from fixed-width design files. Manually converting every value to `vw` is repetitive, hard to review, and easy to drift away from the source design.

This plugin keeps the authored value close to the design file:

- Designers and developers can compare code against the original `px` spec.
- Responsive scaling is generated consistently across breakpoints.
- Desktop max layouts can keep exact fixed `px` values.
- Static values such as borders can opt out with `spx`.

It is useful when the design intent is "preserve the pixel-based visual rhythm, but adapt it responsively."

## Korean Summary

디자인 시안의 `px` 값을 코드에 그대로 남겨두면서 모바일/태블릿/데스크톱 구간별 `vw` 대응을 자동 생성하는 Tailwind CSS 플러그인입니다.

비주얼 완성도가 중요한 브랜드 사이트, 캠페인 페이지, 인터랙티브 프로젝트에서 디자인 원본의 pixel rhythm을 유지한 채 반응형 레이아웃을 관리하기 위해 만들었습니다.

## Installation

```bash
npm install @designfever/tailwind-mq
```

## Setup

Add the plugin to `tailwind.config.js`:

```js
import { plugin } from 'tailwindcss/plugin';
import TailwindMq, { Mq } from '@designfever/tailwind-mq';

// Optional settings
Mq.setBreakPoint([620, 1024, 1280]); // default
Mq.setMobileRatio(2); // default

export default {
  plugins: [plugin(TailwindMq)],
};
```

## Usage

```txt
mq-[property|mobile<tablet<desktop]
```

- Separate values with `<` in breakpoint order.
- `px` values are converted to `vw` for each breakpoint.
- The final desktop max value stays as fixed `px`.
- Missing values inherit the previous value.
- Use `_` instead of spaces in Tailwind class names.

```html
<!-- 3 values: mobile / tablet / desktop -->
<div class="mq-[width|100px<200px<300px]"></div>

<!-- 2 values: mobile / tablet~desktop -->
<div class="mq-[display|none<block]"></div>

<!-- Spaced shorthand values -->
<div class="mq-[padding|0_0_0_10px<0_0_0_20px<0_0_0_30px]"></div>
```

## Breakpoints

Default: `[620, 1024, 1280]`

| Range | Condition | `vw` base |
| --- | --- | --- |
| Mobile | `<= 620px` | `620 / mobileRatio` (default: 310) |
| Tablet | `621px ~ 1024px` | `1024` |
| Desktop | `1025px ~ 1280px` | `1280` |
| Max | `>= 1281px` | fixed `px` |

## Units

| Unit | Description |
| --- | --- |
| `px` | Converted to `vw` |
| `spx` | Static px. Kept as fixed `px` without conversion |

```html
<!-- 10px is converted to vw, 2spx stays as px -->
<div class="mq-[border|1spx_solid_transparent<2spx_solid_black]"></div>
```

## API

### `Mq.setBreakPoint(value: number[])`

Sets the breakpoint array. The last value + 1 is appended internally for the max layout range.

```js
Mq.setBreakPoint([375, 768, 1440]);
```

### `Mq.setMobileRatio(value: number)`

Sets the mobile `vw` base as `breakPoint[0] / ratio`. Use `2` when a mobile design is prepared at 2x resolution.

```js
Mq.setMobileRatio(2); // 620 / 2 = 310px base
```

### `Mq.constantStyle`

Registers reusable values that can be referenced by name in class strings. Number values automatically receive the `px` unit.

```js
Mq.constantStyle = {
  HEADER: 60, // -> 60px
  GUTTER: 20, // -> 20px
};
```

```html
<div class="mq-[padding-top|HEADER]"></div>
<div class="mq-[margin|0_GUTTER]"></div>
```

`_` in constant names is converted to a space (`BORDER_SOLID` -> `border solid`).

### `Mq.setSupportCalcAutoRatio(value: boolean)`

Enables automatic ratio-based interpolation when fewer values are provided.

- 1 value: tablet and desktop values are calculated from the mobile value.
- 2 values: tablet is interpolated from `[mobile, desktop]`.

```js
Mq.setSupportCalcAutoRatio(true);
```

```html
<!-- Tablet and desktop values are calculated automatically -->
<div class="mq-[width|100px]"></div>
```

### `Mq.setOverlap(value: boolean)`

When `true`, media queries are omitted if the value is the same as the previous breakpoint.

```js
Mq.setOverlap(true);
```

### `getMqByString(str, isString?)`

Parses an `mq` class body directly.

```js
import { getMqByString } from '@designfever/tailwind-mq';

getMqByString('width|100px<200px<300px');
// {
//   width: '32.25806vw',
//   '@media (min-width : 621px)': { width: '19.53125vw' },
//   '@media (min-width : 1025px)': { width: '23.4375vw' },
//   '@media (min-width : 1281px)': { width: '300px' }
// }

getMqByString('width|100px<200px<300px', true); // returns string
```

## Examples

```html
<!-- font-size -->
<p class="mq-[font-size|14px<16px<18px]"></p>

<!-- display switch -->
<div class="mq-[display|none<block]"></div>

<!-- transform -->
<div class="mq-[transform|translateX(10px)<translateX(20px)]"></div>

<!-- mixed static values (spx) -->
<div class="mq-[border-width|1spx<2spx<2spx]"></div>
```

## License

MIT

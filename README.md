# @designfever/tailwind-mq

tailwind-mq is a simple utility to generate media queries for Tailwind CSS.

## Installation

```
npm install @designfever/tailwind-mq
```

## Usage

add the plugin to your {tailwind.config.js} file

```javascript 
import TailwindMq from '@designfever/tailwind-mq';

export default {
  ...,
  plugins: [plugin(TailwindMq)]
};
```

### Example

```html
<div class="mq-[width|100px<100px<100px]"></div>
<div class="mq-[display|none<block]"></div>
<div class="mq-[padding|0_0_0_10px<0_0_0_20px<0_0_0_30px]"></div>
```


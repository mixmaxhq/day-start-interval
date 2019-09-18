# day-start-interval

[![Build Status](https://travis-ci.com/mixmaxhq/day-start-interval.svg?branch=master)](https://travis-ci.com/mixmaxhq/day-start-interval)

This package exports an isomorphic function that works like `setInterval`, but aligns itself to the
start of each day. You might use this client-side to update a UI that shows new information each
day. You might use this server-side, from within a websocket handler, to push new information to the
client when the day changes.

## Installation

For use from both the browser and Node:

`npm install day-start-interval`

For use in the browser, you will also need to install `moment-timezone` as described
[here](https://momentjs.com/timezone/docs/#/use-it/browser/), and configure your bundler to resolve
that dependency. If you wish to load `moment-timezone` from a CDN like JSDelivr, for instance, and
are using Rollup, you might do:

```html
<!-- in your HTML -->
<script src="//cdn.jsdelivr.net/combine/npm/moment@2.24.0/moment.min.js,npm/moment-timezone@0.5.26/builds/moment-timezone-with-data.min.js"></script>
```

```js
// Part of your Rollup configuration
{
  external: ['moment-timezone'],
  globals: {
    'moment-timezone': 'moment'
  }
}
```

You may also need to configure your bundler to upconvert this module from CJS to ESM e.g. using
`rollup-plugin-commonjs` (exercise left to the reader). https://github.com/mixmaxhq/day-start-interval/issues/4
tracks adding a ESM build to this project.

## Usage

First, import the library:

```js
// In the browser:
import { setDayStartInterval } from 'day-start-interval';
```

```js
// In Node:
const { setDayStartInterval } = require('day-start-interval');
```

Then, determine the user's time zone. The library can't determine when the day starts without this
information: as of this writing, it is 2:06pm on September 18th in San Francisco, but already
6:36am on September _19th_ in Adelaide, Australia!

Client-side, you can use `moment-timezone` and use `moment.tz.guess()` to figure this out:

```js
import moment from 'moment-timezone';

const tz = moment.tz.guess();
```

If you wish to use this library server-side, you can determine the time zone client-side and then
pass that to the server (exercise left to the reader).

Finally:

```js
setDayStartInterval(() => {
  console.log("It's a new day!");
}, { tz });
```

### Does this library expect your code to actually run for more than 24 hours?

I mean… it might, right? Some users keep tabs open _forever_, and you might even expect them to do
so if you're making some sort of dashboard for them.

And if the client is alive for more than 24 hours, than a corresponding websocket process might
live for more than 24 hours too. (_Theoretically_&mdash;you should make sure that your client can
gracefully reconnect if your websocket servers cycle, the network connection drops, etc!)

But, it's totally possible for `setDayStartInterval` to fire much sooner than 24 hours, depending
on when you call it&mdash;if you call it at 11:59pm, then it will fire for the first time in just
one minute.

### Error handling

As with `setInterval`, if `func` throws, that exception will not be caught. You are responsible
for adding your own `try-catch` inside `func` if needed. If `func` throws, this library does not
make any guarantees about whether the interval will continue to run.

## Contributing

We welcome bug reports and feature suggestions, as well as contributions!

Please add tests for any changes. You can run the tests continuously as you work by doing `env
WATCH=true npm run test`.

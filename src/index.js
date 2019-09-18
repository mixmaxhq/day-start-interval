const moment = require('moment-timezone');

// Use moment to calculate this since we already have it.
const ONE_DAY_IN_MS = moment.duration(1, 'days').asMilliseconds();

/**
 * Repeatedly call a function at the start of the day.
 *
 * @param {function} func - The function to call.
 * @param {object} options
 *   @param {string} tz - The time zone to use to determine when the day starts. Values are those
 *     used by `moment-timezone` and returned by `moment.tz.guess()`.
 *
 * @return {function} A function that you can call to cancel the interval.
 */
function setDayStartInterval(func, { tz }) {
  const now = moment().tz(tz);
  const startOfTomorrow = now.clone().add(1, 'days').startOf('day');

  // First, align to the start of the next day.
  const timeTillStartOfTomorrow = startOfTomorrow.diff(now);

  let interval;
  const timeout = setTimeout(() => {
    // Now fire the function daily. Micro-optimization: we register this before firing `func` for
    // the first time so as to not delay scheduling it.
    //
    // This also happens to guarantee that `setInterval` will be scheduled, although this only has
    // the effect of actually continuing to run the interval in a browser environment, given that in
    // Node, an uncaught exception will probably cause the process to exit. As such, this library
    // does not attempt to guarantee that the interval will continue to run in any environment.
    interval = setInterval(func, ONE_DAY_IN_MS);

    // Fire the function for the first time.
    func();
  }, timeTillStartOfTomorrow);

  return () => {
    // Note that passing invalid IDs here is fine per docs, no exceptions thrown.
    clearTimeout(timeout);
    clearInterval(interval);
  };
}

module.exports = { setDayStartInterval };

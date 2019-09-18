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
    // Now fire the function daily. Safety belts / micro-optimization: we register this before
    // firing it for the first time to guarantee we schedule even if the function throws, also so as
    // to not delay scheduling it.
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

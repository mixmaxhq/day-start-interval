const lolex = require('lolex');
const moment = require('moment-timezone');
const { setDayStartInterval } = require('../src');

describe('setDayStartInterval', () => {
  let clock, intervalFn;
  beforeEach(() => {
    clock = lolex.install({
      // This is 8pm PDT sharp on 2019-09-17.
      now: moment(1568775600000).tz('America/Los_Angeles').toDate()
    });
    intervalFn = jest.fn();
  });

  afterEach(() => {
    clock.uninstall();
  });

  describe('firing', () => {
    it('should fire at the start of the next day', () => {
      setDayStartInterval(intervalFn, { tz: 'America/Los_Angeles' });
      expect(intervalFn).not.toHaveBeenCalled();

      const start = Date.now();
      clock.runToLast();
      const timeElapsed = Date.now() - start;

      // 4 hours to reach midnight from 8pm.
      expect(timeElapsed).toBe(moment.duration(4, 'hours').asMilliseconds());
      expect(intervalFn).toHaveBeenCalledTimes(1);
    });

    it('should fire at the start of every day after that', () => {
      setDayStartInterval(intervalFn, { tz: 'America/Los_Angeles' });

      // Align to the start of the first day.
      clock.runToLast();

      // Now test 3 days in a row.
      for (let i = 0; i < 3; i++) {
        intervalFn.mockClear();

        const start = Date.now();
        clock.runToLast();
        const timeElapsed = Date.now() - start;

        expect(timeElapsed).toBe(moment.duration(1, 'days').asMilliseconds());
        expect(intervalFn).toHaveBeenCalledTimes(1);
      }
    });

    it('is time-zone aware', () => {
      setDayStartInterval(intervalFn, { tz: 'America/New_York' });
      expect(intervalFn).not.toHaveBeenCalled();

      const start = Date.now();
      clock.runToLast();
      const timeElapsed = Date.now() - start;

      // 8pm PDT is 11pm EDT, hence 1 hour to reach midnight.
      expect(timeElapsed).toBe(moment.duration(1, 'hours').asMilliseconds());
      expect(intervalFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancellation', () => {
    it('should be possible to cancel the initial fire', () => {
      const cancel = setDayStartInterval(intervalFn, { tz: 'America/Los_Angeles' });
      cancel();

      clock.runToLast();

      expect(intervalFn).not.toHaveBeenCalled();
    });

    it('should be possible to cancel subsequent fires', () => {
      const cancel = setDayStartInterval(intervalFn, { tz: 'America/Los_Angeles' });

      clock.runToLast();
      expect(intervalFn).toHaveBeenCalled();
      intervalFn.mockClear();

      cancel();

      clock.runToLast();
      expect(intervalFn).not.toHaveBeenCalled();
    });
  });
});

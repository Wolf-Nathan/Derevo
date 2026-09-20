/**
 * jsdom's `location`/`location.href` accessors are non-configurable (matches
 * real browsers), so they can't be overridden or spied on directly — any
 * assignment to a different path triggers jsdom's "not implemented:
 * navigation" error, routed through the environment's `console.error`
 * (see @jest/environment-jsdom-abstract's `jsdomError` handler). This
 * suppresses that noise around a `location.href = ...` assignment and
 * exposes the spy so a test can still assert a redirect was *attempted*.
 */
function suppressNavigation() {
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  return {
    errorSpy,
    restore() {
      errorSpy.mockRestore();
    }
  };
}

module.exports = { suppressNavigation };

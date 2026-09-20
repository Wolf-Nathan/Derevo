/**
 * dev/js/editPerson.js and dev/js/infos.js assign to `personModif`,
 * `personInfo`, and an unscoped `enfant` loop variable without var/let,
 * which leaks them onto the real global object (same bug class as the
 * "Fix personDel not set as global value" commit). jest.resetModules()
 * clears the require cache, not global.*, so those leaks must be cleaned
 * up explicitly or a later test can silently inherit stale state.
 */
function snapshotGlobals() {
  return new Set(Object.keys(global));
}

function cleanupNewGlobals(before) {
  Object.keys(global).forEach((key) => {
    if (!before.has(key)) {
      delete global[key];
    }
  });
}

module.exports = { snapshotGlobals, cleanupNewGlobals };

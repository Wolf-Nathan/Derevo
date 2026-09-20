const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const DEV_JS_DIR = path.join(REPO_ROOT, 'dev', 'js');

/**
 * Mounts a dev/js/*.js page script for real inside jsdom and returns the
 * live Vue instance it creates. Each script is a plain global-scope
 * `new Vue({ el: '#xxx', ... })` with no exports, so the only way to get a
 * handle on it is to let it mount against a fixture element and read the
 * instance back off `el.__vue__` (set by Vue 2 itself on mount).
 */
function loadScript(scriptName, { fixtureId, url = '/' } = {}) {
  if (!fixtureId) {
    throw new Error("loadScript requires a fixtureId matching the script's el selector");
  }

  jest.resetModules();

  // Stub globals the scripts' top-level object literals reference directly
  // (evaluated at parse time, before any test logic runs).
  global.AOS = { init: jest.fn() };
  global.vdp_translation_fr = { js: {} };
  global.vuejsDatepicker = {};

  const Vue = require(path.join(DEV_JS_DIR, 'vue.js'));
  Vue.config.silent = true;
  Vue.config.productionTip = false;
  global.Vue = Vue;

  window.history.pushState({}, '', url);

  document.body.innerHTML = `<div id="${fixtureId}"></div>`;

  require(path.join(DEV_JS_DIR, scriptName));

  return document.getElementById(fixtureId).__vue__;
}

module.exports = { loadScript, DEV_JS_DIR };

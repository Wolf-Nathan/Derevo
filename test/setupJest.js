// Vue.config (silent/productionTip) can't be set here: dev/js/vue.js is
// required fresh per-test (via test/helpers/loadScript.js, after
// jest.resetModules()), so each fresh require returns a brand-new
// constructor whose config must be set at that point, not once globally.

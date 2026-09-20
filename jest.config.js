module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/test/unit/**/*.test.js'],
  setupFiles: ['<rootDir>/test/setupJest.js'],
  // @vue/test-utils requires 'vue' internally; the npm 'vue' package's
  // default entry is the runtime-only build, which can't compile the
  // `template:` strings genereArbre.js's Personne component uses. Map to
  // the full build (compiler included) so mount() can compile them.
  moduleNameMapper: {
    '^vue$': 'vue/dist/vue.common.dev.js'
  }
};

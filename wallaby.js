module.exports = function (wallaby) {
  return {
    files: [
      'src/**/*.es6',
      'src/**/*.snap'
    ],
    tests: [
      'test/**/*.test.js'
    ],

    env: {
      type: 'node',
      runner: 'node'
    },

    compilers: {
      "**/*.es6": wallaby.compilers.babel()
    },

    testFramework: 'jest',

    debug: true
  };
};
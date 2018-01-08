const path = require('path');

module.exports = {
  "extends": "airbnb-base",
  settings: {
    'import/resolver': {
      'eslint-import-resolver-lerna': {
        packages: path.resolve(__dirname, 'packages')
      }
    }
  },
  "rules": {
    "arrow-body-style": ["off"],
    "arrow-parens": ["off"],
    "eol-last": "error",
    "linebreak-style": ["error", "unix"],
    "max-len": ["error", 120],
    "no-param-reassign": ["error", { "props": false }],
    "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
    "no-restricted-syntax": [
      "error",
      {
        "selector": "ForInStatement",
        "message": "for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array."
      },
      {
        "selector": "WithStatement",
        "message": "`with` is disallowed in strict mode because it makes code impossible to predict and optimize."
      }
    ],
    "no-underscore-dangle": ["error", { "allow": ["_id", "_source", "_scroll_id"] }],
    "no-use-before-define": ["error", "nofunc"],
    "quotes": ["error", "single", {"avoidEscape": true, "allowTemplateLiterals": true}],
    "require-jsdoc": "warn",
    "require-yield": "warn",
    "valid-jsdoc": "warn"
  },
  "env": {
    "node": true
  },
  "overrides": [
    {
      "files": [
        "packages/*/test/**/*.js",
        "test/**/*.js"
      ],
      "rules": {
        "import/no-extraneous-dependencies": "off"
      },
      "env": {
        "mocha": true
      }
    },
    {
      "files": [
        "Gulpfile.js"
      ],
      "rules": {
        "import/no-extraneous-dependencies": "off"
      }
    }
  ]
}

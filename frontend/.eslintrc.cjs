module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    // enable additional rules
    "indent": ["error", 2],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],

    // override configuration set by extending "eslint:recommended"
    "no-empty": "warn",
    "no-cond-assign": ["error", "always"],

    // disable rules from base configurations
    "for-direction": "off",
  }
};
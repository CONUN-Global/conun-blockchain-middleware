module.exports = {
  extends: ['3box', '3box/jest', '3box/typescript'],
  parserOptions: {
    project: ['tsconfig.json'],
  },
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
  },
}

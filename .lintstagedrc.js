module.exports = {
  '{apps,libs}/**/*.{js,jsx,ts,tsx},!**/api/**': [
    'eslint --fix',
    'prettier --write',
  ],
  '{apps,libs}/**/*.{md,json},!**/api/**': ['prettier --write'],
};

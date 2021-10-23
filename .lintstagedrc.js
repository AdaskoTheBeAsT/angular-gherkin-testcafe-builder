module.exports = {
  './packages/**/*.{js,jsx,ts,tsx}': ['eslint --fix'],
  './packages/**/*.{js,jsx,ts,tsx,css,scss,md,html,json}': ['prettier --write'],
};

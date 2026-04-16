/** @type {import("prettier").Config} */
module.exports = {
  plugins: ["prettier-plugin-tailwindcss"],
  semi: true, // add semicolons at the end of statements
  singleQuote: false, // use double quotes instead of single
  trailingComma: "es5", // trailing comma where valid in ES5 (objects, arrays, etc.)
  tabWidth: 2, // 2 spaces per tab
  printWidth: 80, // max line width before wrapping
};

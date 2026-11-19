/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./cover.html",
    "./privacy/**/*.html",
    "./assets/**/*.js",
    "./*.js",
  ],
  // 运行时版本支持任意值写法，保持开启
  theme: { extend: {} },
  plugins: [],
  // 兜底：JS 里动态拼出来的工具类
  safelist: [
    { pattern: /^(bg|text|border|ring|from|to|via)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900)$/ },
    { pattern: /^(bg|text|border)-(white|black|transparent)$/ },
    { pattern: /^(opacity)-(0|5|10|20|25|30|40|50|60|70|75|80|90|95|100)$/ },
  ],
};
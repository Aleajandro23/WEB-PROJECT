/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./**/*.html", // Incluye todos los archivos HTML en cualquier carpeta y subcarpeta
    "./**/*.js"    // (Opcional) Si también tienes archivos JavaScript con clases de Tailwind
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

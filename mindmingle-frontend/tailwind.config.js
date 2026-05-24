/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors'
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // primary: {
                //     600: "#4f46e5",
                //     700: "#4338ca",
                // }
                primary: colors.indigo
            }
        },
    },
    plugins: [],
}
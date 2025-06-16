// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './app/**/*.{ts,tsx}',  // Pages in /app
        './app/components/**/*.{ts,tsx}',  // Your UI components
    ],
    theme: {
        extend: {
            colors: {
                lavender: {
                    50:  '#f9f7fc',
                    100: '#f0eafd',
                    200: '#e0d3fa',
                    300: '#cbb5f5',
                    400: '#b89ef0',
                    500: '#a27ae3', // main
                    600: '#8e64c9',
                    700: '#774fa6',
                    800: '#5d3d80',
                    900: '#3f2957',
                    950: '#27193b',
                },
                mint: {
                    50:  '#f6fcfa',
                    100: '#e2f9f4',
                    200: '#c3f0e5',
                    300: '#a0e1d5',
                    400: '#7ad0c3',
                    500: '#55bbae', // main
                    600: '#3da299',
                    700: '#2f807a',
                    800: '#25655f',
                    900: '#1b4641',
                    950: '#102d29',
                },
                blush: {
                    50:  '#fff8fa',
                    100: '#ffeaf0',
                    200: '#ffd3df',
                    300: '#fbb8cb',
                    400: '#f89cb6',
                    500: '#f27fa0', // main
                    600: '#db5f89',
                    700: '#b5486d',
                    800: '#8f3653',
                    900: '#642638',
                    950: '#3f151f',
                },
                skyblue: {
                    50:  '#f5fcfe',
                    100: '#e1f6fb',
                    200: '#c3e9f4',
                    300: '#a2d7ea',
                    400: '#81c3dd',
                    500: '#64accf', // main
                    600: '#4e8fb5',
                    700: '#3c7091',
                    800: '#2d556f',
                    900: '#1e394c',
                    950: '#101f2a',
                },
                pale: {
                    50:  '#fffcf2',
                    100: '#fff6d7',
                    200: '#ffeead',
                    300: '#ffe17f',
                    400: '#ffd456',
                    500: '#ffbf29', // main
                    600: '#d99f1e',
                    700: '#b37f16',
                    800: '#8f620f',
                    900: '#6a4709',
                    950: '#422d05',
                },
            },
        },
    },
    plugins: [],
}

export default config;
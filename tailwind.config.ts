import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'blanco-roto': '#F5F0E9',
        'carbon': '#3A3A3A',
        'malva': '#8367C7',
        'turquesa': '#73D8D4',
        'coral': '#FF9E8A',
      },
    },
  },
  plugins: [],
};
export default config;

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        indigo: {
          600: '#4f46e5',
          700: '#4338ca',
        },
        purple: {
          600: '#9333ea',
          700: '#7e22ce',
        },
        pink: {
          600: '#db2777',
          700: '#be185d',
        },
      },
      animation: {
        gradient: 'gradient 8s linear infinite',
        'gradient-slow': 'gradient 12s ease-in-out infinite', // Slower variation
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Optional: Add plugin for better form styling
  ],
};
